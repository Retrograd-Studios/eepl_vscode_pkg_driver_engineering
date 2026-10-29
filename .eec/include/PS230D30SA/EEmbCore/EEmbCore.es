enum {
	UI_SW_AIN = 0,
	UI_DI = 1,
	UI_LVL,
	UI_AIN,
	UI_LOAD,
	UI_INPUT_COUNT
}

enum {
	RELAY_1 = 0,
	RELAY_2, 
	RELAYS_COUNT
}

enum {
	LED_WORK = 2,
	LED_ERROR = 3,
	LEDS_COUNT = 2
}

enum {
	AO_1 = 0,
	AO_COUNT
}




enum {
	UI_MODE_DI = 0,
	UI_MODE_AI,
	UI_MODE_TEMP,
	UI_MODE_TEMP2,
	UI_MODE_FSR_LVL,
	UI_MODE_FSR_LOAD,
	UI_MODE_FSR_AI
}

enum {
	EEMB_DISPLAY_WIDTH = 160,
	EEMB_DISPLAY_HEIGHT = 128
}


enum {
	SW_MODE1 = 0,
	SW_MODE2,
	SW_CUR2,
	SW_CUR1,
	RS_RST,
	SW_FIRE
}

enum  {
	UART_COM_0 = 0,
	UART_COM_1,
	UART_COM_COUNT
}

enum {
	COLOR_BLACK = 0,
	COLOR_WHITE = 0xFFFF
} 



let DEV_deviceName = "M72FSR"
let DEV_manufacturerName = "Moderon"




extern demangle func SET_BUTTON_HANDLER( func {(uint32, uint32) -> void}  )
extern demangle func DelayMs( uint32 ) -> void

extern demangle func RELAY_SET(uint32, uint8)
extern demangle func RELAY_TOGGLE(uint32)
extern demangle func RELAYS_TOGGLE(uint32)
extern demangle func RELAYS_SET(uint32, uint8)
extern demangle func AO_OUTPUT(uint32, uint32)
extern demangle func UI_READ_DI(uint32) -> uint32
extern demangle func UI_READ_AI(uint32) -> int32
extern demangle func UI_READ_ALL_DI(uint32) -> uint32
extern demangle func UI_CFG(uint32, uint32)
extern demangle func UI_CFG_SET_RANGE(uint32, int32, int32, int32)
extern demangle func UI_CFG_SET_B(uint32, uint32)
extern demangle func BTN_GET_STATUS(uint8) -> uint8

extern demangle func FSR_setPowerLevel(uint32)
extern demangle func FSR_changeState(uint8)
extern demangle func FSR_getResetErrorCode(uint8) -> uint8
extern demangle func FSR_setupParams(uint32, uint8, uint16)
extern demangle func GetGlobalTicks() -> uint32



func LED_SET(mask: uint32, level: uint8){
	RELAY_SET(mask, level)
}

func LED_TOGGLE(mask: uint32){
	RELAY_TOGGLE(mask)
}

func LEDS_TOGGLE(mask: uint32){
	RELAYS_TOGGLE(mask)
}

func LEDS_SET(mask: uint32, level: uint8){
	RELAYS_SET(mask, level)
}



func __GetStringLength0(str: pointer) -> uint32 {

	var len = 0
	
	let arr = [1, 2]// CastTo($&uint8[0xFFFFFFFF]$ str)
	
	for i, v in arr {
		if v == '\0' {
			return i
		}
	}
	
	return 0
}

