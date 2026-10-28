struct PI{
    lastTicks : uint32
    lastError : int16
    intPart : float
    lastKi : uint16 
    lastKp : uint16
    lastBasis: uint16
    lastMantis:uint16
    delayed : bool = false
    delaying : bool = false

    lastOut : int16
    error : int16
    errorEpsilon : uint32 = 10
    lastRawOut : int16 // сигнал от -100 до 1100

    //Диапазон сигнала 0-1000 ошибки -10000-10000
    func cycle(Active : bool, Error : int16, Kp : uint16, Ki:uint16, Hysteresis : uint16, UpdateTime : uint16, Mantis : uint16, Basis : uint16, Min : uint16, Max : uint16) -> uint16{
        
        let sysTicks = GetGlobalTicks()
        //если выключен или поменялся коэф то зануляем
        if(!Active || self.lastKp!=Kp || self.lastKi != Ki || self.lastMantis != Mantis || self.lastBasis != Basis)
        {
            self.lastError = 0
            self.intPart = 0
            self.lastOut = 0
            self.error = 0
            self.lastRawOut = 0
            self.lastKp = Kp
			self.lastKi = Ki
			self.lastMantis = Mantis
			self.lastBasis = Basis
            if(!Active){
                return self.lastOut
            }
        }

        //Работа

        //Проверка на время, гистерезис, и на обрыв
        var cast : uint32 = UpdateTime
        if((sysTicks - self.lastTicks) < cast)
        {
            return self.lastOut
        }
        self.lastTicks = sysTicks

        if(abs(Error) > 20000){
            return self.lastOut
        }

        if(abs(Error) < Hysteresis){
            return self.lastOut
        }

        //подсчет интегральной части

        let mantis = MantisCalc(Mantis)
        //Если сырой сигнал не вышел за пределы, то обновляем интегральную часть
        if(Error > 0 && (self.lastRawOut <Max * 1.05) || Error < 0 && (self.lastRawOut > Min * -0.05)){
            self.intPart += (Error/10) * Ki
        }
        
        //Считаем сырой сигнал
        let buf : int32 = (Error/10 * Kp + self.intPart)
        let buf2 : int16 = buf/(mantis>0 ? mantis : 1)
        self.lastRawOut = Basis + buf2

        //Trim
        self.lastRawOut = self.lastRawOut > Max * 1.1 ? Max * 1.1 : (self.lastRawOut < Min * -0.1 ? Min * -0.1 : self.lastRawOut)
        //self.lastRawOut = Trim(self.lastRawOut, -100, 1100)

        self.lastOut = self.lastRawOut > Max ? Max : (self.lastRawOut < Min ? Min : self.lastRawOut)

        return self.lastOut
    }

    func clear(){
        self.lastOut = 0
        self.lastRawOut = 0
        self.intPart = 0
        self.delayed = false
        self.delaying = false
    }
}

func abs(val : int16) -> uint16{
    return val >= 0 ? val : -val
} 

func MantisCalc(Mantis : uint16) -> uint16{
    var res = 1
    for i in 0 .. <Mantis{
        res *=10
    }
    return res
}

func Trim(val : int16, min :int16, max :int16) -> int16{
    return val < min ? min : (val > max ? max : val)
}