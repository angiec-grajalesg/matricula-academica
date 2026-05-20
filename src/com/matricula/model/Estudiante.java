package com.matricula.model;

import java.util.HashMap;
import java.util.Map;

public class Estudiante {
    private String estudianteId;
    private String nombre;
    private String apellido;
    private String correo;
    private String programa;
    private int semestre;
    private EstadoEstudiante estado;
    private Map<String, Double> notasPorAsignatura = new HashMap<>();

    public Estudiante(String estudianteId, String nombre, String apellido, String correo, String programa, int semestre, EstadoEstudiante estado) {
        this.estudianteId = estudianteId;
        this.nombre = nombre;
        this.apellido = apellido;
        this.correo = correo;
        this.programa = programa;
        this.semestre = semestre;
        this.estado = estado;
    }

    public String getEstudianteId() {
        return estudianteId;
    }

    public String getNombre() {
        return nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public String getCorreo() {
        return correo;
    }

    public String getPrograma() {
        return programa;
    }

    public int getSemestre() {
        return semestre;
    }

    public EstadoEstudiante getEstado() {
        return estado;
    }

    public void setEstado(EstadoEstudiante estado) {
        this.estado = estado;
    }

    public Map<String, Double> getNotasPorAsignatura() {
        return notasPorAsignatura;
    }

    public void agregarNota(String asignaturaId, double nota) {
        notasPorAsignatura.put(asignaturaId, nota);
    }

    public boolean aproboAsignatura(String asignaturaId) {
        return notasPorAsignatura.getOrDefault(asignaturaId, 0.0) >= 3.0;
    }
}
