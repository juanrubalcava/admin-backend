var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var alumnoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, required: false },
    telefono: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }


}, { collection: 'alumnos' });



module.exports = mongoose.model('alumnos', alumnoSchema);