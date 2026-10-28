

SetPackageName( main )

SetSources("./fsr_app.es","./Pid.es")

FindPackage( "./Modbus" )
FindPackage( "./GlobalVars" )


//-- указываем название функции, которая вызывается при запуске приложения
SetEntryPoint( init )

//-- выделить память под кучу
SetHeapMemoryInBytes( 12 * 1024 )

//-- выделить память под стек основного таска
SetStackForMainTask( 1024 )
//-- выделить память под стек таска отрисовки
SetStackForDrawTask( 1024 )


//-- говорим что хотим создать приложение
BuildApp( M72FSR )

