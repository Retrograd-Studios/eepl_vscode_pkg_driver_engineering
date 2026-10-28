
ENTRY(__entryPoint__)

DrawText = 0x800868d;
DrawImg = 0x800868f;
_DrawRect = 0x8008691;
AO_OUTPUT = 0x800718f;
UI_READ_DI = 0x8006d39;
UI_READ_AI = 0x800719d;
UI_READ_ALL_DI = 0x80075c3;
UI_CFG = 0x80075f9;
UI_CFG_SET_RANGE = 0x8007749;
UI_CFG_SET_B = 0x8007777;
RELAY_SET = 0x8006cb5;
RELAY_TOGGLE = 0x8006cd1;
RELAYS_TOGGLE = 0x8006ce5;
RELAYS_SET = 0x8006d09;
RELAYS_SET = 0x8006d09;
MB_READ_LOCAL_REG = 0x8005041;
MB_WRITE_LOCAL_REG = 0x800505d;
MB_GET_ERROR = 0x8005031;
MB_WRITE_REMOTE_REG = 0x8004e2d;
MODBUS_CFG = 0x8005073;
UART_CFG = 0x8007791;
SET_BUTTON_HANDLER = 0x8006f1b;
DelayMs = 0x800593f;
Print = 0x800703b;
Println = 0x8007085;
GetGlobalTicks = 0x8007033;
FONT_DEFAULT = 0x20000688;
img_default_switchOn = 0x20000694;
img_default_switchOff = 0x20000698;
img_default_car = 0x2000069c;
img_default_ctrl = 0x200006a0;
__eg_set_color = 0x8008693;
__eg_set_font = 0x8008695;
__eg_row_begin = 0x8008697;
__eg_row_draw = 0x8008699;
__eg_layout_begin = 0x800869b;
__eg_list_begin = 0x800869f;
__eg_layout_draw = 0x80086a1;
__eg_flow_layout_begin = 0x800869d;
__eg_flow_layout_draw = 0x80086a3;
__eg_label_draw = 0x80086a5;
__eg_list_draw = 0x80086a7;
__eg_img_draw = 0x80086a9;
__eg_switcher_draw = 0x80086ab;
__eg_input_int_draw = 0x80086ad;
__eg_input_float_draw = 0x80086af;
__eg_fill_draw = 0x80086b1;
__eg_button_draw = 0x80086b3;
__eg_combo_box_draw = 0x80086b5;
__eg_ghostStepInParent = 0x80086b7;
__eg_set_borders = 0x80086b9;
__eg_set_unit = 0x80086bb;
EEMB_GUI_CONTEXT_PTR = 0x2000068c;
EEMB_GUI_PARENT_CONTEXT_PTR = 0x20000690;
GUI_buttonHandler = 0x80086bd;
GUI_buttonsHandler = 0x80086bf;
GUI_setDraw = 0x80086c1;
GUI_clearContext = 0x80086c3;
GUI_rowStartStep = 0x80086c5;
DrawImgWithSize = 0x80086c7;
GetTextSize = 0x80086c9;
GetCharHeight = 0x80086cb;
MB_WRITE_H_REG_WITH_ADDR = 0x800509d;
MB_READ_H_REG_FROM_ADDR = 0x8005099;
rtc_setYears = 0x80086f1;
rtc_setMonths = 0x80086f5;
rtc_setDays = 0x80086f9;
rtc_setDay = 0x80086fd;
rtc_setHours = 0x8008701;
rtc_setMins = 0x8008705;
rtc_setSeconds = 0x8008709;
RTC_SET_DATE = 0x800870d;
RTC_SET_DATE_2 = 0x8008711;
RTC_GET_DATE = 0x8008715;
rtc_getYears = 0x8008719;
rtc_getMonths = 0x800871d;
rtc_getDays = 0x8008721;
rtc_getDay = 0x8008725;
rtc_getHours = 0x8008729;
rtc_getMins = 0x800872d;
rtc_getSeconds = 0x8008731;
MB_REMOTE_MODULE_ADD_INSTANCE = 0x8004285;
MB_WRITE_REMOTE_REG_WITH_INST = 0x8004c1d;
xTimerGenericCommand = 0x8006841;
xTimerCreate = 0x80067c3;
xTimerIsTimerActive = 0x8006bd5;
xTimerGetPeriod = 0x80068a3;
pcTimerGetName = 0x80068d3;
pcTimerSetName = 0x80068eb;
xTimerGetExpiryTime = 0x80068bb;
xTaskGetTickCount = 0x8005c01;
vTimerSetTimerID = 0x8006c27;
pvTimerGetTimerID = 0x8006c03;
EEmb_MemAlloc = 0x800cb11;
EEmb_MemFree = 0x800cb15;
EEmb_Panic = 0x8006e25;
MemGetFreeHeapSize = 0x800555d;
MemGetMinimumEverFreeHeapSize = 0x8005563;
uxTaskGetStackHighWaterMark = 0x8005f7b;
EEmb_getSerialNumber = 0x800c9d1;
EEmb_getDeviceVerInfo = 0x800c9ed;
DEV_reboot = 0x80077e3;
IWDG_setTimeout = 0x800c87d;
IWDG_reload = 0x800c8a1;
DisplaySetBrights = 0x80086cd;
DisplaySetAutoBrights = 0x80086cf;
MSG_pushMessage = 0x80063b5;
MB_FORCE_READ_REMOTE_REGS = 0x80048f7;
MB_FORCE_WRITE_REMOTE_REGS = 0x8004a2b;
LED_SET = 0x80086e5;
LEDS_SET = 0x80086ed;
LED_TOGGLE = 0x80086e1;
LEDS_TOGGLE = 0x80086e9;
__eg_canvas_draw = 0x80086d3;
__eg_fixed_layout_begin = 0x80086d5;
__eg_fixed_flow_layout_begin = 0x80086d7;
__eg_canvas_begin = 0x80086d9;
UART_SET_FRAME_CFG = 0x80077b1;
EEmb_buttonHandler = 0x8007a65;
FSR_setPowerLevel = 0x80090d3;
FSR_changeState = 0x8009111;
FSR_getResetErrorCode = 0x8009147;
FSR_setupParams = 0x8009155;
BTN_GET_STATUS = 0x8006db3;
MB_GET_REMOTE_REG_GRP_FROM_PTR = 0x8004ea7;
MB_GET_INPUT_REG_GRP_FROM_PTR = 0x8004ef9;
MB_GET_HOLDING_REG_GRP_FROM_PTR = 0x8004f59;
MB_STORE_DATA_TO_REG = 0x8005009;
MB_GET_ACTUAL_DATA_PTR = 0x8004ea3;
DEV_EEmbFrameworkCfg = 0x20002618;
__eg_dyn_label_draw = 0x80086db;
__eg_animation_draw = 0x80086dd;
MODBUS_SET_LOCAL_CHANGED_CALLBACK = 0x80022cb;
MODBUS_CHECK_LOCAL_CHANGED = 0x80022d3;
UART_SET_PROTOCOL = 0x8002ae5;
UART_SET_TIMEOUT = 0x8002b01;
UART_RX_SIZE = 0x8002b13;
UART_FLUSH_RX = 0x8002b2b;
UART_RX_BUF = 0x8002bbf;
UART_WRITE_DATA = 0x8002bcf;
UART_READ_DATA = 0x8002bed;


MEMORY
{
  RAM (xrw)    : ORIGIN = 0x200037f8, LENGTH = 0xc808 
  FLASH (rx)   : ORIGIN = 0x8013900, LENGTH = 0x2c500
}

_Min_Heap_Size = 0x200;      /* required amount of heap  */
_Min_Stack_Size = 0x400; /* required amount of stack */

__aeabi_unwind_cpp_pr0 = 0x0;
__aeabi_unwind_cpp_pr1 = 0x0;


/* Define output sections */
SECTIONS
{
  /* The startup code goes first into FLASH 
  .isr_vector :
  {
    . = ALIGN(4);
    KEEP(*(.isr_vector)) 
    . = ALIGN(4);
  } >FLASH
  */

  /* The program code and other data goes into FLASH */
  .text :
  {
    . = ALIGN(4);
    *(.text)           /* .text sections (code) */
    *(.text*)          /* .text* sections (code) */
    *(.glue_7)         /* glue arm to thumb code */
    *(.glue_7t)        /* glue thumb to arm code */
    *(.eh_frame)

    KEEP (*(.init))
    KEEP (*(.fini))

    . = ALIGN(4);
    _etext = .;        /* define a global symbols at end of code */
  } >FLASH

  /* Constant data goes into FLASH */
  .rodata :
  {
    . = ALIGN(4);
    *(.rodata)         /* .rodata sections (constants, strings, etc.) */
    *(.rodata*)        /* .rodata* sections (constants, strings, etc.) */
    . = ALIGN(4);
  } >FLASH

  .ARM.extab   : { *(.ARM.extab* .gnu.linkonce.armextab.*) } >FLASH
  .ARM : {
    __exidx_start = .;
    *(.ARM.exidx*)
    __exidx_end = .;
  } >FLASH

  .preinit_array     :
  {
    PROVIDE_HIDDEN (__preinit_array_start = .);
    KEEP (*(.preinit_array*))
    PROVIDE_HIDDEN (__preinit_array_end = .);
  } >FLASH
  .init_array :
  {
    PROVIDE_HIDDEN (__init_array_start = .);
    KEEP (*(SORT(.init_array.*)))
    KEEP (*(.init_array*))
    PROVIDE_HIDDEN (__init_array_end = .);
  } >FLASH
  .fini_array :
  {
    PROVIDE_HIDDEN (__fini_array_start = .);
    KEEP (*(SORT(.fini_array.*)))
    KEEP (*(.fini_array*))
    PROVIDE_HIDDEN (__fini_array_end = .);
  } >FLASH

  /* used by the startup to initialize data */
  //_sidata = LOADADDR(.data);

  /* Initialized data sections goes into RAM, load LMA copy after code */
  .data : 
  {
    . = ALIGN(4);
    _sdata = .;        /* create a global symbol at data start */
    *(.data)           /* .data sections */
    *(.data*)          /* .data* sections */

    . = ALIGN(4);
    _edata = .;        /* define a global symbol at data end */
  } >RAM AT> FLASH

  
  /* Uninitialized data section */
  . = ALIGN(4);
  .bss :
  {
    /* This is used by the startup in order to initialize the .bss secion */
    _sbss = .;         /* define a global symbol at bss start */
    __bss_start__ = _sbss;
    *(.bss)
    *(.bss*)
    *(COMMON)

    . = ALIGN(4);
    _ebss = .;         /* define a global symbol at bss end */
    __bss_end__ = _ebss;
  } >RAM

  /* User_heap_stack section, used to check that there is enough RAM left 
  ._user_heap_stack :
  {
    . = ALIGN(8);
    PROVIDE ( end = . );
    PROVIDE ( _end = . );
    . = . + _Min_Heap_Size;
    . = . + _Min_Stack_Size;
    . = ALIGN(8);
  } >RAM
*/
  

  /* Remove information from the standard libraries */
  /DISCARD/ :
  {
    libc.a ( * )
    libm.a ( * )
    libgcc.a ( * )
  }

  .ARM.attributes 0 : { *(.ARM.attributes) }
}


