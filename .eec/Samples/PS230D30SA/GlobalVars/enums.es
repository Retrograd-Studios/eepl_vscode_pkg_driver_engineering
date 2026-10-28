import * from EEmbCore

let RELAY_POWER = RELAY_1
let RELAY_WORK = RELAY_2

enum {
	MODE_0_10 = 0,
	MODE_4_20 = 1
}

// Режим работы:  0 - Ручное управление;  1 - Управление по Modbus RTU. 2 - ПИ регулятор; 3 - Выкл.
enum {
	REG_MANUAL = 0,
	REG_MODBUS,
	REG_PI,
	REG_OFF
}

enum {
	MODE_MODBUS = 3,
	MODE_DIST2 = 2,
	MODE_DIST1 = 1,
	MODE_LOCAL = 0
}

enum {
	FIREMODE_ON = 1,
	FIREMODE_OFF = 0
}
// Уставка защиты по току.
// 11 - 3 А; 10 - 2 A; 01 - 1,5 A; 00 - 1 A
enum {
	CD_1 = 11,
	CD_1_5 = 10,
	CD_2 = 1,
	CD_3 = 0
}

// Регистр ошибок:
// 0 bit - пергрузка по току 1
// 1 bit - короткое замыкание 2
// 2 bit - reserved 3
// 3 bit - обрыв линии 4
// 4 bit - ошибка Modbus 5
// 5 bit - контроллер остановлен, работа запрещена 6 
// (5 bit = 1, если любой bit 0…4 = 1)
enum {
	NO_ERROR = 0,
	ERROR_LOAD = 1, // Перегрузка по току, 0 бит
	ERROR_KZ = 2, // Короткое замыкание, 1 бит
	ERROR_MEM_FAIL = 3,
	ERROR_LINE_BREAK = 4, // Обрыв линии, 3 бит
	ERROR_MODBUS = 5,
	ERROR_STOP = 6 // Ошибка связи, 
}

