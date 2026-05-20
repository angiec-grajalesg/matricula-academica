package com.matricula.factory;

import com.matricula.model.Periodo;
import java.time.LocalDate;

public class PeriodoFactory {
    public static Periodo crearPeriodoActivo(String periodoId, String codigo, LocalDate fechaInicio, LocalDate fechaFin) {
        return new Periodo(periodoId, codigo, fechaInicio, fechaFin, true);
    }

    public static Periodo crearPeriodoCerrado(String periodoId, String codigo, LocalDate fechaInicio, LocalDate fechaFin) {
        return new Periodo(periodoId, codigo, fechaInicio, fechaFin, false);
    }
}
