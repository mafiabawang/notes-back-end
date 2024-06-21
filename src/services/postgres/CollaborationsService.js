const { nanoid } = require('nanoid');

const DBUtils = require('../../utils/DBUtils');

const InvariantError = require('../../exceptions/InvariantError');

const tableNames = 'collaborations';

class CollaborationsService {
    constructor() {
        this._dbUtils = new DBUtils();
    }

    async addCollaboration(noteId, userId) {
        const id = `CS-${nanoid(14)}`;
        const values = [id, noteId, userId];

        const rows = await this._dbUtils.insert(tableNames, values);
        if (!rows[0].id) throw new InvariantError('Kolaborasi gagal ditambahkan');

        return rows[0].id;
    }

    async deleteCollaboration(noteId, userId) {
        const values = [noteId, userId];
        const rows = await this._dbUtils.delete(tableNames, `note_id = $1 AND user_id = $2`, values);

        if (!rows.length) throw new InvariantError('Kolaborasi gagal dihapus');
    }
    async verifyCollaborator(noteId, userId) {
        const values = [noteId, userId];
        const rows = await this._dbUtils.select([], tableNames, `note_id = $1 AND user_id = $2`, values);

        if (!rows.length) throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
}

module.exports = CollaborationsService;

