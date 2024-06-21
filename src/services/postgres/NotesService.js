const { nanoid } = require('nanoid');

const DBUtils = require('../../utils/DBUtils');

const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

const tableNames = 'notes';

class NotesService {
    constructor() {
        this._dbUtils = new DBUtils();
    }

    async addNote({ title, body, tags }) {
        const id = nanoid(16);
        const created_at = new Date().toISOString();
        const updated_at = created_at;

        const values = [id, title, body, tags, created_at, updated_at];
        const rows = await this._dbUtils.insert(tableNames, values);
        if (!rows[0].id) throw new InvariantError('Gagal Menambahkan Album');

        return rows[0].id;
    }

    async getNotes() { return await this._dbUtils.select([], tableNames); }

    async getNoteById(id) {
        const rows = await this._dbUtils.select([], tableNames, `id = $1`, [id]);
        if (!rows.length) throw new NotFoundError('Catatan tidak ditemukan');

        return rows[0];
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