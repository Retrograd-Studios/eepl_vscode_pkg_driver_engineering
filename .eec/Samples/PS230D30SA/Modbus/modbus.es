import * from EEmbCore

// INPUT РЕГИСТРЫ (СОСТОЯНИЕ УСТРОЙСТВА)
MODBUS_ADD_LOCAL_I_REG( mi0_opening_angle, 0, 0 )  // 0…100	-	%	Заданный угол открытия в процентах
MODBUS_ADD_LOCAL_I_REG( mi1_reg_errors, 1, 0 )  // 0…31	-	-	Регистр ошибок: 0 bit - пергрузка по току 1 bit - короткое замыкание 2 bit - reserved 3 bit - обрыв линии 4 bit - ошибка Modbus 5 bit - контроллер остановлен, работа запрещена  (5 bit = 1, если любой bit 0…4 = 1)
MODBUS_ADD_LOCAL_I_REG( mi2_state_di1, 2, 0 )  // 0…1	-	-	Состояние дискретного входа(DI): 0 - разомкнут 1 - замкнут
MODBUS_ADD_LOCAL_I_REG( mi3_state_douts, 3, 0 )  // 0…3	-	-	Состояние дискретных выходов: 0 bit - состояние Реле 1 1 bit - состояние Реле 2
MODBUS_ADD_LOCAL_I_REG( mi4_ui_ain, 4, 0 )  // 0…65535	-	-	
MODBUS_ADD_LOCAL_I_REG( mi5_load_current, 5, 0 )  // 0…65535	-	мА	Ток нагрузки в миллиамперах
MODBUS_ADD_LOCAL_I_REG( mi6_defense_current, 6, 0 )  // 1000…3000	-	мА	Уставка защиты по току в миллиамперах
MODBUS_ADD_LOCAL_I_REG( mi7_dist_work_mode, 7, 0 )  // 0…4	-	-	Режим работы: 0 - местный 1 - дистанционный №1 2 - дистанционный №2  3 - Modbus RTU                                                                                                
MODBUS_ADD_LOCAL_I_REG( mi8_ui_lvl, 8, 0 )  // 0…100	-	%	Показания датчика 0…10 В в режиме PI регулятора (обратная связь регулятора). 0…100 % = 0…10 Вольт
MODBUS_ADD_LOCAL_I_REG( mi9_last_error, 9, 0 )  // 0…65535	-	-	Версия устройства: младший байт – версия прошивки; старший байт – версия аппаратного обеспечения.
MODBUS_ADD_LOCAL_I_REG( mi10_current_defense_counter, 10, 0 ) // 0…65535	-	-	Серийный номер
MODBUS_ADD_LOCAL_I_REG( mi11_line_break_counter, 11, 0 ) // 0…65535	-	UNIX TIME	Дата производства: Value*86400 +1577836800 = UNIX TIME
MODBUS_ADD_LOCAL_I_REG( mi12_firemode_load_current, 12, 0 ) // 0…65535	-	-	Информация о конфигурации: 0 bit – наличие Modbus; 1 bit – наличие входа 0_10 В; 2 bit – наличие защиты по перенапряжению; 3 bit – наличие контроля обрыва нагрузки; 4-5 bit – кол-во дискретных входов; 6-7 bit – кол-во дискретных выходов; 8-9 bit – максимальная мощность: • 0 – 80 Вт • 1 – 140 Вт • 2 – 165 Вт • 3 – 220 Вт 
MODBUS_ADD_LOCAL_I_REG( mi13_load_current_ofset, 13, 0 ) // 0…65535		 
MODBUS_ADD_LOCAL_I_REG( mi14_firemode, 14, 0 ) // пожарный режим, 1 - включён, 0 - выключен
MODBUS_ADD_LOCAL_I_REG( mi15_coef, 15, 0 )
MODBUS_ADD_LOCAL_I_REG( mi16_power_val, 16, 0 )
MODBUS_ADD_LOCAL_I_REG( mi17_pi_out, 17, 0 )// выход из пи регулятора
MODBUS_ADD_LOCAL_I_REG( mi18_pi_in, 18, 0 )// выход из пи регулятора
MODBUS_ADD_LOCAL_I_REG( mi19_420_obriv, 19, 0 )// 4-20  оборван
MODBUS_ADD_LOCAL_I_REG( mi20_raw_ui, 20, 0 )// просто вход АИ

// HOLDING РЕГИСТРЫ ( ПАРАМЕТРЫ УСТРОЙСТВА )						
// Адрес	Тип	Запись/Чтение	Диапазон	Знач. по ум.	Ед. измер.	Описание
// MODBUS_ADD_LOCAL_H_REG( name, addr, min, max, default, USE_EEPROM )
MODBUS_ADD_LOCAL_H_REG( mh0_work_mode, 0, 0, 2, 1, true ) // 0	HOLDING	W/R	0...2	0	-	Режим работы:  0 - Выкл.;  1 - Управление по Modbus RTU.     2 - ПИ регулятор;
MODBUS_ADD_LOCAL_H_REG( mh1_min_power, 1, 20, 100, 20, true ) // 1	HOLDING	W/R	0...100	0	%	Минимальная выдаваемая мощность  в процентах.
MODBUS_ADD_LOCAL_H_REG( mh2_max_power, 2, 20, 100, 100, true ) // 2	HOLDING	W/R	0...100	100	%	Максимальная выдаваемая мощность в процентах.
MODBUS_ADD_LOCAL_H_REG( mh3_speed_by_modbus, 3, 0, 100, 0, true ) // 3	HOLDING	W/R	0...100	0	%	Уставка скорости, для режима управления по сети Modbus RTU.
MODBUS_ADD_LOCAL_H_REG( mh4_type_di1, 4, 0, 257, 0, true ) // 4	HOLDING	W/R	0…257	0	-	Настройка дискретного входа DI:  Младший байт: 0 - тип внешнего контакта Н. О.; 1 – тип внешнего контакта Н. З.; Старший байт: 0 – сигнал разрешения работы по дискретному входу не используется; 1 – сигнал разрешения работы по дискретному входу используется.
MODBUS_ADD_LOCAL_H_REG( mh5_type_work_douts, 5, 0, 3855, 3, true ) // 5	HOLDING	W/R	0…3855	512	-	Настройка дискретных выходов: 0 – включение  по работе; 1 – включение по ошибке; 2,3 - зарезервировано 4 – задается по modbus Младший байт – дискретный выход №1. Старший байт – дискретный выход №2.
MODBUS_ADD_LOCAL_H_REG( mh6_max_time_in_load, 6, 15, 90, 15, true ) // 6	HOLDING	W/R	15…90	15	сек.	Допустимое время в перегрузке (ток до 30% выше уставки защиты) в секундах.
MODBUS_ADD_LOCAL_H_REG( mh7_reset_errors, 7, 0, 1, 0, true ) // 7	HOLDING	W/R	0…1	0	-	Сброс ошибок  (Momentary ON): 1 - сброс; 0 - нет эффекта.
MODBUS_ADD_LOCAL_H_REG( mh8_reset_to_factory, 8, 0, 1, 0, true ) // 8	HOLDING	W/R	0…1	0	-	*Сброс к заводским настройкам (Momentary ON):  1 - сброс; 0 - нет эффекта 
MODBUS_ADD_LOCAL_H_REG( mh9_set_modbus_doutputs, 9, 0, 65535, 0, true ) // 9	HOLDING	W/R				Настройка дискретных выходов по modbus: 0 – выкл 1 – вкл Младший байт – дискретный выход №1. Старший байт – дискретный выход №2.
MODBUS_ADD_LOCAL_H_REG( mh10_reserved_h, 10, 0, 65535, 1, true ) // 10	HOLDING	W/R				зарезервировано (проверка на обрыв всегда)
MODBUS_ADD_LOCAL_H_REG( mh11_set_pi_reg, 11, 0, 65535, 2, true ) // 11	HOLDING	W/R		(1 << 8)		Настройка ПИ регулятора: Младший байт – кол-во знаков после запятой для чисел (для регистров хранящих мантиссу) Старший байт – инвертировать ли знак ошибки
MODBUS_ADD_LOCAL_H_REG( $int16$ mh12_pi_min, 12, 0, 0, -25, true ) // 12	HOLDING	W/R	all	-25		PI min (мантисса)
MODBUS_ADD_LOCAL_H_REG( $int16$ mh13_pi_max, 13, 0, 0, 60, true ) // 13	HOLDING	W/R	all	60		PI max (мантисса)
MODBUS_ADD_LOCAL_H_REG( $int16$ mh14_pi_set, 14, 0, 0, 0, true ) // 14	HOLDING	W/R	all	0		PI уставка (мантисса)
MODBUS_ADD_LOCAL_H_REG( mh15_pi_start_speed, 15, 20, 100, 20, true ) // 15	HOLDING	W/R	0..100	0		PI начальная скорость в процентах
MODBUS_ADD_LOCAL_H_REG( mh16_p_coeff, 16, 0, 65535, 1, true ) // 16	HOLDING	W/R	all	1		P коэф. (мантисса)
MODBUS_ADD_LOCAL_H_REG( mh17_i_coeff, 17, 0, 65535, 1, true ) // 17	HOLDING	W/R	all	1		I коэф. (мантисса)
MODBUS_ADD_LOCAL_H_REG( mh18_update_period, 18, 0, 65535, 100, true ) // 18	HOLDING	W/R	all	1	сек.	Период обновления регулятора PI. Если 0, то 100 мс
MODBUS_ADD_LOCAL_H_REG( mh19_modbus_addr, 19, 1, 255, 1, true ) // 19	HOLDING	W/R	1…255	1	-	Адрес Modbus
MODBUS_ADD_LOCAL_H_REG( mh20_baudrate, 20, 0, 38400, 9600, true ) // 20	HOLDING	W/R	0…2	0	-	*Скорость Modbus, бит/сек.: 0 - 9600; 1 - 19200;  2 - 38400.
MODBUS_ADD_LOCAL_H_REG( mh21_parity, 21, 0, 2, 0, true ) // 21	HOLDING	W/R	0…2	0	-	*Четность Modbus: 0 - нет проверки; 1 - Проверка четности; 2 - Проверка нечетности.
MODBUS_ADD_LOCAL_H_REG( mh22_stop_bits, 22, 0, 1, 0, true ) // 22	HOLDING	W/R	0…1	0	-	*Кол-во стоп бит Modbus: 0 - 1 stop bit; 1 - 2 stop bit.
MODBUS_ADD_LOCAL_H_REG( mh23_modbus_timeout, 23, 0, 65535, 0, true ) // 23	HOLDING	W/R	0…65535	10	сек.	Таймаут Modbus в секундах:  0 - без таймаута
MODBUS_ADD_LOCAL_H_REG( mh24_break_current, 24, 0, 1000, 140, true ) // 23	HOLDING	W/R	0…65535	ток обрыва
MODBUS_ADD_LOCAL_H_REG( mh25_pi_start_delay, 25, 0, 1000, 20, true ) // задержка начала работы пи регулятора в секундах
MODBUS_ADD_LOCAL_H_REG( mh26_dec_part_sens, 26, 0, 5, 1, true ) // кол-во знаков после запятой у датчика (только для UI)
MODBUS_ADD_LOCAL_H_REG( mh27_obriv_delay, 27, 0, 60, 2, true ) // заддержка обрыва 4-20 секунды
MODBUS_ADD_LOCAL_H_REG( mh100_mem_check, 100, 0, 0xFFFF, 9876, true ) // проверка памяти))) !=9876 => сброс до заводских + авария
