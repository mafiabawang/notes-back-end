const autoBind = require('auto-bind');

class NotesHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postNoteHandler(request, h) {
        this._validator.validateNotePayload(request.payload);
        const { title = 'untitled', body, tags } = request.payload;
        const noteId = await this._service.addNote({ title, body, tags });

        return h.response({
            status: 'success',
            message: 'Catatan berhasil ditambahkan',
            data: {
                noteId
            }
        }).code(201);
    }

    async getNotesHandler() {
        const notes = await this._service.getNotes();
        return {
            status: 'success',
            data: {
                notes
            }
        };
    }

    async getNoteByIdHandler(request) {
        const { id } = request.params;
        const note = await this._service.getNoteById(id);
        return {
            status: 'success',
            data: {
                note
            }
        };
    }

    async putNoteByIdHandler(request) {
        this._validator.validateNotePayload(request.payload);
        const { id } = request.params;
        await this._service.editNoteById(id, request.payload);

        return {
            status: 'success',
            message: 'Catatan berhasil diperbarui'
        };

    }

    async deleteNoteByIdHandler(request) {
        const { id } = request.params;
        await this._service.deleteNoteById(id);

        return {
            status: 'success',
            message: 'Catatan berhasil dihapus'
        };
    }
}

module.exports = NotesHandler;