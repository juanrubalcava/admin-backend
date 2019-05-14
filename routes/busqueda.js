var express = require('express');

var app = express();

var Proyecto = require('../models/empresa');

var Usuario = require('../models/usuario');

//=========================================
// Busqueda por coleccion
//=========================================

app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch (tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;

        case 'empresas':
            promesa = buscarEmpresas(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de coleccion son usuarios y empresas',
                error: { message: 'Tipo de coleccion novalida' }
            });
    }

    promesa.then(data => {

        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    })

});

//=========================================
// Busqueda general
//=========================================

app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            buscarEmpresas(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {

            res.status(200).json({
                ok: true,
                proyectos: respuestas[0],
                usuarios: respuestas[1],
            });

        })

});

function buscarEmpresas(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Proyecto.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, empresa) => {


                if (err) {
                    reject('error al cargar empresas', err);
                } else {
                    resolve(empresa)
                }

            });

    });


}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {

                if (err) {
                    reject('Error Al Cargar Usuarios', err);
                } else {
                    resolve(usuarios)
                }

            })

    });


}

module.exports = app;