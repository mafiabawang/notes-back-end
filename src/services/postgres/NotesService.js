const { nanoid } = require('nanoid');

const DBUtils = require('../../utils/DBUtils');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

const tableNames = 'notes';

class NotesService {
    constructor(collaborationService) {
        this._dbUtils = new DBUtils();
        this._collaborationService = collaborationService;
    }

    async verifyNoteOwner(id, owner) {
        const rows = await this._dbUtils.select([], tableNames, `id = $1`, [id]);
        if (!rows.length) throw new NotFoundError('Catatan tidak ditemukan');

        const note = rows[0];
        if (note.owner !== owner) throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }

    async verifyNoteAccess(noteId, userId) {
        try {
            await this.verifyNoteOwner(noteId, userId);
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }

            try {
                await this._collaborationService.verifyCollaborator(noteId, userId);
            } catch {
                throw error;
            }
        }
    }

    async addNote({ title, body, tags, owner }) {
        const id = `NS-${nanoid(14)}`;
        const created_at = new Date().toISOString();
        const updated_at = created_at;

        const values = [id, title, body, tags, created_at, updated_at, owner];
        const rows = await this._dbUtils.insert(tableNames, values);

        if (!rows[0].id) throw new InvariantError('Gagal Menambahkan Catatan');

        return rows[0].id;
    }

    async getNotes(owner) {
        const columns = ['notes.id', 'title', 'body', 'tags', 'created_at', 'updated_at', 'owner'];
        const joinTables = ['collaborations'];
        const joinConditions = ['notes.id = collaborations.note_id'];

        return await this._dbUtils.select(
            columns,
            tableNames,
            'notes.owner = $1 OR collaborations.user_id = $1',
            [owner],
            joinTables,
            joinConditions,
            'notes.id'
        );
    }

    async getNoteById(id) {
        const columns = ['notes.id', 'title', 'body', 'tags', 'created_at', 'updated_at', 'owner', 'username'];
        const joinTables = ['users'];
        const joinConditions = ['notes.owner = users.id'];

        const rows = await this._dbUtils.select(
            columns,
            tableNames,
            'notes.id = $1',
            [id],
            joinTables,
            joinConditions
        );

        if (!rows.length) throw new NotFoundError('Catatan tidak ditemukan');

        return rows[0];
        console.log(rows[0]);
    }

    async editNoteById(id, { title, body, tags }) {
        const updated_at = new Date().toISOString();
        const columns = ['title', 'body', 'tags', 'updated_at'];

        const values = [title, body, tags, updated_at, id];
        const rows = await this._dbUtils.update(tableNames, columns, `id = $${values.length}`, values);

        if (!rows.length) throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    async deleteNoteById(id) {
        const rows = await this._dbUtils.delete(tableNames, `id = $1`, [id]);
        if (!rows.length) throw new NotFoundError('Gagal menghapus catatan. Id tidak ditemukan');
    }
}

module.exports = NotesService;