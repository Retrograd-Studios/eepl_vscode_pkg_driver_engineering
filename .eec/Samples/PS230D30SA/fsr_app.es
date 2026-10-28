import * from EEmbCore
import * from ModbusValues
import * from GlobalVars

// Принцип работы регулятора
// Регулирование осуществляется за счет симмистора VS1, который управляется микроконтроллером через V1 
// для гальванической развязки. Управляющий ШИМ-сигнал -AO_PWM1_LOAD для фазово-импульсного управления. 
// Для осуществления корректного управления симистором также используются сигналы UI_ADC2_ZC. 
// UI_ADC2_ZC - сигнал пересечения нуля. Регулирование мощности осуществляется по средствам изменения угла открытия симистора.

var power_val_new = 0.0
var power_val = 0.0
let in_sense_val = 10

var current_defense_counter = 0

// Аналоговый вход
// В любом режиме имеет верх диапазона равный 2,49 В(3092 ед.). 
// Для режима 4-20 мА, 4 мА соответствует 0,50 В(620 ед.). 
// Режим входа считывается по входу UI_ADC8_SW_AIN. 
// Дистанционное задание скорости считается от минимума диапазона, которому присваивается угол ALPHA0, 
// до верха диапазона равного максимальному углу открытия. 

func configFSR(){
	UI_CFG( UI_LOAD, UI_MODE_FSR_LOAD )
	UI_CFG( UI_SW_AIN, UI_MODE_DI )
	UI_CFG( UI_LVL, UI_MODE_FSR_LVL ) // 
	UI_CFG( UI_DI, UI_MODE_DI)
	UI_CFG( UI_AIN, UI_MODE_FSR_AI )
	UI_CFG_SET_RANGE( UI_AIN, 0, 10000, 0 )
}

// MODBUS_CFG( uint32_t PORT_NAME, uint32_t isMaster, uint32_t timeout, uint8_t devAddr )
// PORT_NAME - имя порта (UART_COM_0/UART_COM_1)
// isMaster - включить ли режим мастера
// timeout - ожидание опроса для режимам slave. Если 0, то таймаута нет
// devAddr - адрес устройства

// MODBUS_CFG( UART_COM_0, MB_SLAVE_ID, 1000, 0x02 )

// UART_CFG(uint32_t PORT_NAME, uint32_t baudRate, uint32_t parity, uint32_t stopBits)
// PORT_NAME - имя порта ( UART_COM_0 / UART_COM_1 )

// UART_CFG( UART_COM_0, 115200, UART_PARITY_EVEN, UART_TWO_STOPBIT )

struct modbus_struct {
    port_name: uint32
    isMaster: uint32
	timeout: uint32
	devAddr: uint32
	baudRate: uint32
	parity: uint32
	stopBits: uint32
}

var modbus_config = mk modbus_struct{_}

var modbus_default =mk modbus_struct { port_name : 0, isMaster : 0, timeout : 0, devAddr : 1, baudRate : 9600, parity : 0, stopBits : 0}

var im_in_work = false

func init() {
	configFSR()
	var fireStatus = BTN_GET_STATUS( SW_FIRE )
	var cur1Stat = BTN_GET_STATUS( SW_CUR1 )
	var cur2Stat = BTN_GET_STATUS( SW_CUR2 )
 
	FSR_setupParams( 3142, 1, 1 )// ((cur2Stat << 1) | cur1Stat), fireStatus, 0) //
	FSR_changeState( 0 ) // выключить регулятор
	LED_SET( LED_WORK, 1 )
	//RELAY_SET( RELAY_POWER, 1 )
	//mi3_state_douts = mi3_state_douts | ( 1 << RELAY_POWER )
	mi1_reg_errors = 0

	if BTN_GET_STATUS( RS_RST ) {
		reset_to_default()
	}

	modbus_config.port_name = UART_COM_0
	modbus_config.isMaster = 0
	modbus_config.timeout = mh23_modbus_timeout
	modbus_config.devAddr = mh19_modbus_addr
	modbus_config.baudRate = mh20_baudrate
	modbus_config.parity = mh21_parity
	modbus_config.stopBits = mh22_stop_bits
	
		MODBUS_CFG( modbus_config.port_name, modbus_config.isMaster, modbus_config.timeout*1000, modbus_config.devAddr )
		UART_CFG( modbus_config.port_name, modbus_config.baudRate, modbus_config.parity, modbus_config.stopBits )
}

func check_and_change_modbus() {
	if ( modbus_config.timeout != mh23_modbus_timeout || modbus_config.devAddr != mh19_modbus_addr || modbus_config.baudRate != mh20_baudrate || modbus_config.parity != mh21_parity || modbus_config.stopBits != mh22_stop_bits ) {
		modbus_config.timeout = mh23_modbus_timeout
		modbus_config.devAddr = mh19_modbus_addr
		modbus_config.baudRate = mh20_baudrate
		modbus_config.parity = mh21_parity
		modbus_config.stopBits = mh22_stop_bits

		MODBUS_CFG( modbus_config.port_name, modbus_config.isMaster, modbus_config.timeout, modbus_config.devAddr )
		UART_CFG( modbus_config.port_name, modbus_config.baudRate, modbus_config.parity, modbus_config.stopBits )
	}
}

var prev_fm = -1

func reset_to_default() {
	LED_SET( LED_ERROR, 1 )
	var power_val_new = 0
	var power_val = 0
	let in_sense_val = 10

	var prev_mode = -1
	var prev_cd = -1
	

	var reset_counter = 0

	mi0_opening_angle = 0  // 0…100	-	%	Заданный угол открытия в процентах
	mi1_reg_errors = 0   // 0…31	-	-	Регистр ошибок: 0 bit - пергрузка по току 1 bit - короткое замыкание 2 bit - reserved 3 bit - обрыв линии 4 bit - ошибка Modbus 5 bit - контроллер остановлен, работа запрещена  (5 bit = 1, если любой bit 0…4 = 1)
	mi2_state_di1 = 0   // 0…1	-	-	Состояние дискретного входа(DI): 0 - разомкнут 1 - замкнут
	mi3_state_douts = 0   // 0…3	-	-	Состояние дискретных выходов: 0 bit - состояние Реле 1 1 bit - состояние Реле 2
	mi4_ui_ain = 0   // 0…65535	-	-	Зарезервированно
	mi5_load_current = 0   // 0…65535	-	мА	Ток нагрузки в миллиамперах
	mi6_defense_current = 0   // 1000…3000	-	мА	Уставка защиты по току в миллиамперах
	mi7_dist_work_mode = 0   // 0…4	-	-	Режим работы: 0 - местный 1 - дистанционный №1 2 - дистанционный №2  3 - Modbus RTU  4 - ПИ-регулятор                                                                                                
	mi8_ui_lvl = 0   // 0…100	-	%	Показания датчика 0…10 В в режиме PI регулятора (обратная связь регулятора). 0…100 % = 0…10 Вольт
	mi12_firemode_load_current = 0 // 0…65535	-	-	Информация о конфигурации: 0 bit – наличие Modbus; 1 bit – наличие входа 0_10 В; 2 bit – наличие защиты по перенапряжению; 3 bit – наличие контроля обрыва нагрузки; 4-5 bit – кол-во дискретных входов; 6-7 bit – кол-во дискретных выходов; 8-9 bit – максимальная мощность: • 0 – 80 Вт • 1 – 140 Вт • 2 – 165 Вт • 3 – 220 Вт 	
	

	mh0_work_mode = 0 // 0	HOLDING	W/R	0...2	0	-	Режим работы:  0 - Ручное управление;  1 - Управление по Modbus RTU.     2 - ПИ регулятор; 3 - Выкл.
	mh1_min_power = 20 // 1	HOLDING	W/R	0...100	0	%	Минимальная выдаваемая мощность  в процентах.
	mh2_max_power = 100 // 2	HOLDING	W/R	0...100	100	%	Максимальная выдаваемая мощность в процентах.
	mh3_speed_by_modbus = 0 // 3	HOLDING	W/R	0...100	0	%	Уставка скорости, для режима управления по сети Modbus RTU.
	mh4_type_di1 = 0 // 4	HOLDING	W/R	0…257	0	-	Настройка дискретного входа DI:  Младший байт: 0 - тип внешнего контакта Н. О.; 1 – тип внешнего контакта Н. З.; Старший байт: 0 – сигнал разрешения работы по дискретному входу не используется; 1 – сигнал разрешения работы по дискретному входу используется.
	mh5_type_work_douts = 3 // 5	HOLDING	W/R	0…3855	512	-	Настройка дискретных выходов: 0 – включение  по работе; 1 – включение по ошибке; 2,3 - зарезервировано 4 – задается по modbus Младший байт – дискретный выход №1. Старший байт – дискретный выход №2.
	mh6_max_time_in_load = 15 // 6	HOLDING	W/R	15…90	15	сек.	Допустимое время в перегрузке (ток до 30% выше уставки защиты) в секундах.
	mh7_reset_errors = 0 // 7	HOLDING	W/R	0…1	0	-	Сброс ошибок  (Momentary ON): 1 - сброс; 0 - нет эффекта.
	mh8_reset_to_factory = 0 // 8	HOLDING	W/R	0…1	0	-	*Сброс к заводским настройкам (Momentary ON):  1 - сброс; 0 - нет эффекта 
	mh9_set_modbus_doutputs = 0 // 9	HOLDING	W/R				Настройка дискретных выходов по modbus: 0 – выкл 1 – вкл Младший байт – дискретный выход №1. Старший байт – дискретный выход №2.
	mh10_reserved_h = 1 // 10	HOLDING	W/R				зарезервировано (проверка на обрыв всегда)
	mh11_set_pi_reg = 2 // 11	HOLDING	W/R		(1 << 8)		Настройка ПИ регулятора: Младший байт – кол-во знаков после запятой для чисел (для регистров хранящих мантиссу) Старший байт – инвертировать ли знак ошибки
	mh12_pi_min = -25 // 12	HOLDING	W/R	all	-25		PI min (мантисса)
	mh13_pi_max = 60 // 13	HOLDING	W/R	all	60		PI max (мантисса)
	mh14_pi_set = 0 // 14	HOLDING	W/R	all	0		PI уставка (мантисса)
	mh15_pi_start_speed = 0 // 15	HOLDING	W/R	0..100	0		PI начальная скорость в процентах
	mh16_p_coeff = 1 // 16	HOLDING	W/R	all	1		P коэф. (мантисса)
	mh17_i_coeff = 1 // 17	HOLDING	W/R	all	1		I коэф. (мантисса)
	mh18_update_period = 100 // 18	HOLDING	W/R	all	1	сек.	Период обновления регулятора PI. Если 0, то 100 мс
	mh19_modbus_addr = 1 // 19	HOLDING	W/R	1…255	1	-	Адрес Modbus
	mh20_baudrate = 9600 // 20	HOLDING	W/R	0…2	0	-	*Скорость Modbus, бит/сек.: 0 - 9600; 1 - 19200;  2 - 38400.
	mh21_parity = 0 // 21	HOLDING	W/R	0…2	0	-	*Четность Modbus: 0 - нет проверки; 1 - Проверка четности; 2 - Проверка нечетности.
	mh22_stop_bits = 0 // 22	HOLDING	W/R	0…1	0	-	*Кол-во стоп бит Modbus: 0 - 1 stop bit; 1 - 2 stop bit.
	mh23_modbus_timeout = 0 // 23	HOLDING	W/R	0…65535	10	сек.	Таймаут Modbus в секундах:  0 - без таймаута
	mh24_break_current = 140
	mh25_pi_start_delay = 20
	mh26_dec_part_sens = 1
	mh27_obriv_delay = 2
	mh100_mem_check = 9876
	reset_errors()
	
	if mh8_reset_to_factory {
		mh8_reset_to_factory = 0
	}
}

var firemode_counter = 0
var line_break_conter = 0

func reset_errors() {
	if mi1_reg_errors == 0 {
		return
	}
	current_defense_counter = 0
	firemode_counter = 0
    line_break_conter = 0

	setError( NO_ERROR )

	power_val = 0
	power_val_new = 0

	if mh7_reset_errors {
		mh7_reset_errors = 0
	}
}

var prev_current_load = 0

var piBlock : PI = {_}

var Iobrivcounter = 0
var lastObrivTicks = 0

var errorLedCounter = 0
var lastPiSet : int16 = 0

func loop() {
	DelayMs( 100 )
	checkHoldings()
	if(mh8_reset_to_factory){
		reset_to_default()
	}

	mi2_state_di1 = UI_READ_DI( UI_DI )

	if BTN_GET_STATUS( RS_RST ) {
		reset_errors()
		return
	}

	if mh7_reset_errors == 1 {
		reset_errors()
	}

	

	if mi13_load_current_ofset == 0 {
		mi13_load_current_ofset = UI_READ_AI( UI_LOAD )
	}
	mi5_load_current = UI_READ_AI( UI_LOAD )

	// 	if mi5_load_current > 4000 {
	// 		mi5_load_current = prev_current_load
	// 	} else {
	// 		prev_current_load = mi5_load_current
	// 	}
	var read = UI_READ_AI( UI_AIN )
	mi20_raw_ui = read
	if(UI_READ_DI( UI_SW_AIN ) == 0){
		if(read<1500){
			if(Iobrivcounter == 0){
				lastObrivTicks = GetGlobalTicks()
				Iobrivcounter =1
			}
			//насчитываем обрыв
			if(Iobrivcounter < mh27_obriv_delay*1000){

				
				Iobrivcounter += GetGlobalTicks()-lastObrivTicks
				lastObrivTicks = GetGlobalTicks()
			}
			//если оборвался то записываем значение обрыва
			if(Iobrivcounter >= mh27_obriv_delay*1000){
				
				mi19_420_obriv = 1
				mi4_ui_ain = 0x8000
			}
		}else if (read < 2000){
			
			mi19_420_obriv = 0
			Iobrivcounter = 0
			mi4_ui_ain = 0
		}else {
			mi4_ui_ain = read
			mi19_420_obriv = 0
			Iobrivcounter = 0
			mi4_ui_ain = ((mi4_ui_ain -2000) * 10)/8
		}
	}else{
		mi4_ui_ain = UI_READ_AI( UI_AIN )
		mi19_420_obriv = 0
		Iobrivcounter = 0
	}
	mi8_ui_lvl = UI_READ_AI( UI_LVL )

	let mode1 = BTN_GET_STATUS( SW_MODE1 ) 
	let mode2 = BTN_GET_STATUS( SW_MODE2 ) 
	let fire_mode = BTN_GET_STATUS( SW_FIRE )

	let cur1 = BTN_GET_STATUS( SW_CUR1 )
	let cur2 = BTN_GET_STATUS( SW_CUR2 )

	if ( cur1 == 0 ) & ( cur2 == 0 ) {
		mi6_defense_current = 3000
	} else if ( cur1 == 0 ) & ( cur2 == 1 ) {
		mi6_defense_current = 2000
	} else if ( cur1 == 1 ) & ( cur2 == 0 ) {
		mi6_defense_current = 1500
	} else {
		mi6_defense_current = 1000
	}

	if mode1 && mode2 {
		mi7_dist_work_mode = MODE_MODBUS
	} else if mode1 {
		mi7_dist_work_mode = MODE_DIST2
	} else if mode2 {
		mi7_dist_work_mode = MODE_DIST1
	} else {
		mi7_dist_work_mode = MODE_LOCAL
	}
	var min = mh1_min_power
	if min < 20 {
		min = 20
	}
	let diapazon = mh2_max_power - min
	let step = 9000.0 / diapazon

	mi15_coef = step

	// LED_TOGGLE( LED_WORK )
	// Светодиод “Работа”. Горит при выключенном выходе, готов к работе. Мигает с интервалом 1 с при включенном выходе.
	// 0 - выключен
	// 1 - включен
	// LED_TOGGLE( LED_ERROR )
	// Светодиод “Авария”. Горит при наличии хотя бы одной ошибки, мигает с интервалом 1 с при перегрузке.
	// 0 - выключен
	// 1 - включен
	// Реле №1 (RELAY_POWER) - взводится при подаче питания, сбрасывается при наличии неисправностей/ошибок.
	// Реле №2 (RELAY_WORK) - взводится при работе выхода регулятора. Возможна настройка задержки включения через Modbus RTU.
	// Кнопка сброс (RS_RST) - при удержании 5 сек происходит сброс до заводских настроек.


	

	if mi7_dist_work_mode == MODE_LOCAL {
		// Местный - запуск/остановка устройства, задание скорости осуществляется ручкой на лицевой панели. 
		// Начальная 10%-зона хода ручки является нулевой - в ней регулятор выключен, переходя эту границу регулятор переходит 
		// в рабочий режим. 
		// power_val_new = UI_READ_AI( UI_LVL ) * 0.1 // power_val has 10kmax val
		power_val_new = ( mh1_min_power + ( UI_READ_AI( UI_LVL ) - 950 ) / step ) * 10
		mi16_power_val = power_val_new // mh1_min_power + ( UI_READ_AI( UI_LVL ) - 1000 ) / step
	} else if mi7_dist_work_mode == MODE_DIST1 {
		// Дистанционный №1 - запуск/остановка осуществляется внешним сигналом DI типа сухой контакт. 
		// Задание скорости осуществляется ручкой на лицевой панели.
		
			power_val_new = ( mh1_min_power + ( UI_READ_AI( UI_LVL ) - 950 ) / step ) * 10
			// power_val_new = UI_READ_AI( UI_LVL ) * 0.1 // power_val has 10kmax val
		
	} else if mi7_dist_work_mode == MODE_DIST2 {
		// Дистанционный №2 - запуск/остановка осуществляется внешним сигналом DI типа сухой контакт. 
		// Задание скорости осуществляется внешним аналоговым сигналом AIN. Сигнал AIN может быть типа 0-10 В, 
		// либо 4-20 мА. Выбирается DIP-переключателем №1(0-10/4-20).
		
			if UI_READ_DI( UI_SW_AIN ) == 1 { // 0-10 В
				if(mi4_ui_ain <= 700){
					power_val_new = 0
				}
				if(mi4_ui_ain >=1000){
					//1000 = 10000 * 100 + 1000 
					
					power_val_new = ((mi4_ui_ain - 1000) * (mh2_max_power - mh1_min_power))/900 + mh1_min_power*10  // power_val has 10kmax val
				}else if(power_val_new > mh1_min_power * 10)
					{
						power_val_new = mh1_min_power * 10
					}
				mi16_power_val = power_val_new
			} else { // 4-20 А
				if ( mi4_ui_ain < 30000) {
					if(mi4_ui_ain <= 700){
						power_val_new = 0
					}else if(mi4_ui_ain >=1000){
						power_val_new = ((mi4_ui_ain - 1000) * (mh2_max_power - mh1_min_power))/900 + mh1_min_power*10  // power_val has 10kmax val
					}else if(power_val_new > mh1_min_power * 10){
						power_val_new = mh1_min_power * 10
					}
				} else {
					power_val_new = fire_mode ? mh3_speed_by_modbus*10 : 0
				}
			}
		
	} else if mi7_dist_work_mode == MODE_MODBUS {
		// Modbus RTU - запуск/остановка устройства, задание скорости осуществляется по порту RS-485.
		// ПИ-регулятор - может быть активирован при управлении по сети Modbus RTU, через программу для настрйки регулятора. 
		// В данном режиме вход 0-10В используется для подключения датчика, который осуществляет обратную связь ПИ-регулятора.
			
		// Режим работы:  0 - Ручное управление;  1 - Управление по Modbus RTU. 2 - ПИ регулятор; 3 - Выкл.
		// if mh0_work_mode == REG_MANUAL {
		// 	power_val_new = ( mh1_min_power + ( UI_READ_AI( UI_LVL ) - 950 ) / step ) * 10
		// 	mi16_power_val = power_val_new // mh1_min_power + ( UI_READ_AI( UI_LVL ) - 1000 ) / step
		//} else 
		if mh0_work_mode == REG_MODBUS {
			if mh3_speed_by_modbus >= mh1_min_power && (mh3_speed_by_modbus < mh2_max_power) {
				power_val_new = mh3_speed_by_modbus * 10 // думаю, т.к. это скорость в процентах
			} else if mh3_speed_by_modbus >= mh2_max_power {
				power_val_new = mh2_max_power * 10
			} else {
				power_val_new = 0
			}
		} else if mh0_work_mode == REG_PI {
			// ПИ РЕГУЛЯТОР
			mi18_pi_in = (mi4_ui_ain*(mh13_pi_max.GetSigned() - mh12_pi_min.GetSigned()))/10000 + mh12_pi_min.GetSigned()
			if(piBlock.delayed){
				//(Active : bool, Error : int16, Kp : uint16, Ki:uint16, Hysteresis : uint16, UpdateTime : uint16, Mantis : uint16, Basis : uint16) -> uint16
				let castPiSet : int16 = ((mh14_pi_set.GetSigned() - mh12_pi_min.GetSigned())*10000)/(mh13_pi_max.GetSigned()-mh12_pi_min.GetSigned())
				
				let realMin = mh1_min_power >= 20 && mh1_min_power <= 100 && mh1_min_power <= mh2_max_power ? mh1_min_power : 20
				let realMax = mh2_max_power <= 100 && mh2_max_power >= 20 && mh1_min_power <= mh2_max_power ? mh2_max_power : 100 
				mi17_pi_out = piBlock.cycle(true,(castPiSet - mi4_ui_ain.GetSigned())* ((mh11_set_pi_reg & (1 << 8)) > 0 ? -1 : 1), mh16_p_coeff, mh17_i_coeff, 5, mh18_update_period, mh11_set_pi_reg & 0xFF, mh15_pi_start_speed * 10, realMin * 10, realMax * 10)
				power_val_new = mi17_pi_out < mh1_min_power*10 ? mh1_min_power*10 : (mi17_pi_out > mh2_max_power*10 ? mh2_max_power*10 : mi17_pi_out)
				if(mi4_ui_ain == 0x8000){
					mi17_pi_out = mh15_pi_start_speed*10
					power_val_new = mi17_pi_out
				}
				}
			else{
				let sysTicks = GetGlobalTicks()
				if(piBlock.delaying == false){
					piBlock.lastTicks = sysTicks
					piBlock.delaying = true
				}
				if((sysTicks - piBlock.lastTicks)>= mh25_pi_start_delay*1000){
					piBlock.delayed = true
				}
				mi17_pi_out = mh15_pi_start_speed*10
				power_val_new = mi17_pi_out
			}
			
		} else {
			power_val_new = 0
		}
	}

	if(lastPiSet != mh14_pi_set.GetSigned()){
		piBlock.intPart = 0
		lastPiSet = mh14_pi_set.GetSigned()
	}

	if(mi7_dist_work_mode != MODE_MODBUS || mh0_work_mode != REG_PI || !itsInWork() ){
		lastPiSet = mh14_pi_set.GetSigned()
		piBlock.clear()
	}

	//mb timeout
	let errorCode = MB_GET_ERROR(UART_COM_0)

	if ((errorCode == MB_ERROR_TIMEOUT) && mi7_dist_work_mode == MODE_MODBUS && !checkError(ERROR_MODBUS)) {
		setError(ERROR_MODBUS)
	}

	if(checkError(ERROR_LINE_BREAK)){
		LED_SET(LED_ERROR,1)
	} else if errorLoad()
	{
		LED_TOGGLE( LED_ERROR )
	} else if (mi1_reg_errors == 0 && mi19_420_obriv)
	{
		errorLedCounter++
		if(errorLedCounter%10 == 0){
			LED_TOGGLE( LED_ERROR )
		}
	} else if (checkError(ERROR_MEM_FAIL)){
		errorLedCounter++
		//две вспышки и 1 сек красн
		LED_SET(LED_ERROR, (errorLedCounter % 20) < 5 ? (errorLedCounter % 2) : 1)
	}else if (checkError(ERROR_MODBUS)){
			errorLedCounter++
			//две вспышки и 1 сек афк
			LED_SET(LED_ERROR, (errorLedCounter % 20) < 4 ? (errorLedCounter % 2) : 0)
	} 
	 else if (mi1_reg_errors == 0){
		LED_SET(LED_ERROR , 0)
	} 


	if fire_mode == FIREMODE_ON {
		checkFireMode( fire_mode )
		// LED_SET( LED_ERROR, 0 )
		// Также у регулятора есть дополнительный режим - Пожарный. 
		// Отключается программная защита по току, начинает осуществляется контроль целостности кабельной линии до двигателя, 
		// когда вентилятор выключен. Пожарный режим активируется DIP-переключателем №6(FIREMODE).
		if ( mi0_opening_angle < min ) {
			if checkError( ERROR_LINE_BREAK ) {
				LED_SET( LED_ERROR, 1 )
			}
			if firemode_counter > 300 {
				firemode_counter = 0
				FSR_changeState( 1 ) // включить регулятор
				FSR_setPowerLevel( 300 )
				DelayMs( 300 )
				if breakLine() {
					if breakLine() {
						if breakLine() {
							setError( ERROR_LINE_BREAK )
							line_break_conter++
						}
					}
				} else {
					line_break_conter = 0
				}
				mi12_firemode_load_current = mi5_load_current
				FSR_changeState( 0 ) // выключить регулятор
			} else {
				firemode_counter = firemode_counter + 1
			}
		} else {
			if ( mi5_load_current > mi6_defense_current * 1.3 ) || current_defense_counter > mh6_max_time_in_load * 10 { // короткое замыкание
				setError( ERROR_KZ )
			} else if ( mi5_load_current > mi6_defense_current ) { // перегрузка по току
				current_defense_counter++
				if checkError( ERROR_KZ ) == false {
					setError( ERROR_LOAD )
				}
			} else if breakLine() && itsInWork() && mi1_reg_errors <= ERROR_LOAD { // обрыв линии
				if line_break_conter > 100 {
					setError( ERROR_LINE_BREAK )
				}
				line_break_conter++
			} else {
				normalWork()
			}
		}
	} else { // обычный режим
		checkFireMode( fire_mode )
		if ( mi5_load_current > mi6_defense_current * 1.3 ) || current_defense_counter > mh6_max_time_in_load * 10 { // короткое замыкание, выключаем регулятор, прекращаем работу
			stopWork()
			setError( ERROR_KZ )
			return
		} else if ( mi5_load_current > mi6_defense_current ) { // перегрузка по току
			setError( ERROR_LOAD )
			current_defense_counter = current_defense_counter + 1
		} else if breakLine() && itsInWorkWithoutErrors() { // обрыв линии
			if line_break_conter > 100 {
				stopWork()
				setError( ERROR_LINE_BREAK )
				return
			}
			line_break_conter = line_break_conter + 1
		} else { // нормальная работа
			normalWork()
		}
		// Устройство имеет настраиваемую программную защиту по току. 
		// Уставка защиты выбирается DIP-переключателями №2,3(CURRENT1, CURRENT2).
	}

	

	
	if itsInWork() {
	// if ( mi8_ui_lvl >= 1000 ) {
	// if ( ( ( power_val_new + in_sense_val ) < power_val ) || ( ( power_val_new - in_sense_val ) > power_val ) ) {
		if power_val_new - 20 > power_val {
			power_val = power_val + 10
		} else {
			power_val = power_val_new 
		}
		// Println( "power_val changed: " + power_val )
		if itsInWork() && ( criticalError() == false || fire_mode == FIREMODE_ON )  {
			var set_power = TRIM(power_val , MAX(mh1_min_power,20)*10 , MIN(mh2_max_power,100)*10)
			
			
			FSR_setPowerLevel( set_power * 0.92 ) // 0.92 - поправка на датчик
			mi0_opening_angle = set_power/10
			startWork()
		} else {
			FSR_getResetErrorCode(1)
			stopWork()
			mi0_opening_angle = 0
		}
	} else {
		stopWork()
	}
	if itsInWork() && ( criticalError() == false || fire_mode == FIREMODE_ON ) {
		LED_TOGGLE( LED_WORK )
	}

	mi10_current_defense_counter = current_defense_counter
	mi11_line_break_counter = line_break_conter
	setRelays()

	let buferr = mi1_reg_errors | (mi19_420_obriv << 6)
	if(buferr != 0 && buferr != mi9_last_error){
		mi9_last_error = buferr
	}
}

func checkHoldings(){
	if(mh1_min_power >= mh2_max_power || mh1_min_power < 20){
		mh1_min_power = 20
	}
	if(mh2_max_power <= mh1_min_power || mh2_max_power >100){
		mh2_max_power = 100
	}
	if(mh3_speed_by_modbus < mh1_min_power && mh3_speed_by_modbus != 0){
		mh3_speed_by_modbus = mh1_min_power
	}else if (mh3_speed_by_modbus > mh2_max_power)
	{
		mh3_speed_by_modbus = mh2_max_power
	}
	if(mh15_pi_start_speed < mh1_min_power){
		mh15_pi_start_speed = mh1_min_power
	}else if (mh15_pi_start_speed > mh2_max_power){
		mh15_pi_start_speed = mh2_max_power
	}

	if(mh100_mem_check != 9876){
		reset_to_default()
		setError(ERROR_MEM_FAIL)
	}
}

func setRelays(){
	mi3_state_douts = GetValue(mh5_type_work_douts & 255,mh9_set_modbus_doutputs &255) | ((GetValue((mh5_type_work_douts >> 8) & 255,(mh9_set_modbus_doutputs>>8 )&255)  )<<1 )
	RELAY_SET(RELAY_1, GetValue(mh5_type_work_douts & 255,mh9_set_modbus_doutputs &255))
	RELAY_SET(RELAY_2, GetValue((mh5_type_work_douts >> 8) & 255,(mh9_set_modbus_doutputs>>8 )&255)  )
}

func GetValue(type : uint16, mbVal : uint16) -> uint16{
	if (type == 0){
		return itsInWork() && ( (criticalError() == false && mi19_420_obriv == false) || mi14_firemode == FIREMODE_ON )
	}else if (type == 1){
		return criticalError() || mi19_420_obriv
	}else if (type == 2){
		return 1
	}else if (type == 3){
		return !(criticalError() || mi19_420_obriv)
	}else if (type == 4){
		return mbVal
	}
	return 0
}

func checkFireMode( fire_mode: int ) {
	if prev_fm != fire_mode {
		prev_fm = fire_mode
		mi14_firemode = fire_mode
		power_val = 0
	}
}

func normalWork() {
	line_break_conter = 0
	current_defense_counter = 0
	if criticalError() == false && !mi19_420_obriv {
		setError( NO_ERROR )
	}
}

func checkError( error: int ) -> bool {
	return ( mi1_reg_errors & ( 1 << ( error-1 )) )
}

func setError( error: int ) {
	
	if error {
		mi1_reg_errors = mi1_reg_errors | ( 1 << ( error-1 ) )
		mi9_last_error = mi1_reg_errors
		if mi1_reg_errors > 1 {
			//RELAY_SET( RELAY_POWER, 0 ) // взводится при подаче питания, сбрасывается при наличии неисправностей/ошибок.
			//mi3_state_douts = mi3_state_douts & ( 0 << RELAY_POWER )
			
			mi1_reg_errors = mi1_reg_errors | ( 1 << ( ERROR_STOP-1 ) )
			
			if error != ERROR_LINE_BREAK {
				// LED_TOGGLE( LED_ERROR ) // при ошибке по току моргаем лампочкой
			} else {
				LED_SET( LED_ERROR, 1 ) // при обрыве горим непрерывно
			}
		}
	} else {
		mi1_reg_errors = 0
		LED_SET( LED_ERROR, 0 )
		//RELAY_SET( RELAY_POWER, 1 ) // взводится при подаче питания, сбрасывается при наличии неисправностей/ошибок.
		//mi3_state_douts = mi3_state_douts | ( 1 << RELAY_POWER )
	}
}

func startWork() {
	FSR_changeState( 1 ) // включить регулятор
	//RELAY_SET( RELAY_WORK, 1 )
	//mi3_state_douts = mi3_state_douts | ( 1 << RELAY_WORK )
	im_in_work = true
}

func stopWork() {
	FSR_changeState( 0 ) // выключить регулятор
	//RELAY_SET( RELAY_WORK, 0 )
	//mi3_state_douts = mi3_state_douts & ( 0 << RELAY_WORK )
	LED_SET( LED_WORK, 1 )
	im_in_work = false
	mi0_opening_angle = 0
}

var UIReadTicksDelay : uint32 = 0
var lastUiRead = 0
func itsInWork() -> bool {

		
	let sysTicks = GetGlobalTicks()
	var allowWork = true
	//если локал то игнорим сигнал
	if (mi7_dist_work_mode != MODE_LOCAL){
		//используем сигнал в дист1 и дист2, в модбасе только если указано что используем
		if((mh4_type_di1 >> 8) || mi7_dist_work_mode == MODE_DIST1 || mi7_dist_work_mode == MODE_DIST2){
		
			if(lastUiRead == UI_READ_DI(UI_DI)){
					UIReadTicksDelay = sysTicks
			}
			//задержка на изменение сигнала 200 мс
			if(sysTicks - UIReadTicksDelay > 200){
					lastUiRead = UI_READ_DI(UI_DI)
			}	

			if(!lastUiRead && ((mh4_type_di1 & 1) == 0) || (lastUiRead && ((mh4_type_di1 & 1) == 1) )){
				return false
			}
		}
	}
	

	if mi7_dist_work_mode == MODE_LOCAL {
		//ручка >10%
		return ( mi8_ui_lvl >= 1000 )
	} else if mi7_dist_work_mode == MODE_DIST1 {
		//ручка >10%
		return ( mi8_ui_lvl >= 1000 )
	} else if mi7_dist_work_mode == MODE_DIST2 {
		if UI_READ_DI( UI_SW_AIN ) == 1 { // 0-10 В
			var min = 200
			if mh1_min_power > 20 {
				min = mh1_min_power * 10
			}
			return ( ( power_val_new >= min ) ) 
		} else {
			var min = 200
			if mh1_min_power > 20 {
				min = mh1_min_power*10
			}
			//если все ок то просто диапазон, если обрыв, то смотрим что есть пожарка и норм уставка
			return ( ( power_val_new >= min &&  mi4_ui_ain<0x7FFF || (mi4_ui_ain == 0x8000) && (BTN_GET_STATUS( SW_FIRE )) && ( (mh3_speed_by_modbus*10) >= min )) )
		}
		// return ( ( power_val > 100 ) && ( power_val >= mh1_min_power * 10 ) )
	} else if mi7_dist_work_mode == MODE_MODBUS {
		// if mh0_work_mode == REG_MANUAL {
		// 	return ( mi8_ui_lvl >= 1000 )
		//} else 
		
		if mh0_work_mode == REG_MODBUS {
			var min = 20
			if mh1_min_power > 20 {
				min = mh1_min_power 
			}
		return ( mh3_speed_by_modbus >= min )
		} else if mh0_work_mode == REG_PI{
			return true
		} else {
			return false
		}
	}
		// ( power_val > 100 ) && ( power_val >= mh1_min_power * 10 ) )
}

func itsInWorkWithoutErrors() -> bool {
	return itsInWork() && !criticalError()
}

func criticalError() -> bool {
	return mi1_reg_errors > 1
}

func errorLoad() -> bool {
	return ( checkError( ERROR_KZ ) || checkError( ERROR_LOAD ) )
}

func breakLine()-> bool {
	mi5_load_current = UI_READ_AI( UI_LOAD )
	return ( ( mi5_load_current - mi13_load_current_ofset ) < mh24_break_current )
}

// Ошибка	Условие возникновения	Условие снятия	Доп. описание
// Перегрузка по току	100% < Iн =< 130% , Тперегрузки не превышено	Возвращение выходного тока в диапазон 0-100% от Iуст. Отслеживается автоматически.	Не вызывает срабатывание DO1, LED ERROR - мигает. Выход регулятора работает дальше.
// Короткое замыкание	Iн > 130% Iуст, либо 100% < Iн =< 130% на протяжении более, чем Tперегрузки	Выключение регулятора ручкой/DI/Modbus/PC Soft, либо отключение питания.	Выход регулятора отключается, кроме случая пожарного режима. LED ERROR - горит. DO1 - взводится.
// Обрыв линии	Iн ниже 50-150мА, при открытом симмисторе N-кол-во периодов. В пожарном режиме отсутствует ток при коротких подачах напряжения на выход.	 	 
// Ошибка связи	Как и во всех устройствах. Восстановление связи. Отслеживается автоматически.	 

func MAX( a : uint16 , b : uint16 ) -> uint16
{
	return a > b ? a : b
}

func TRIM(value : uint16 , min : uint16 , max : uint16 )-> uint16
{
	return value < min? min : (value > max ? max : value)
}

func MIN( a : uint16  , b : uint16 ) -> uint16
{
	return a > b ? b : a
}