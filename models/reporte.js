var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var reporteSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    descripcion: { type: String, required: [true, 'La descripcion es necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    empresa: {
        type: Schema.Types.ObjectId,
        ref: 'empresa',
        required: [true, 'El id de la empresa es un campo obligatorio']
    }
}, { collection: 'reportes' });

module.exports = mongoose.model('reporte', reporteSchema);