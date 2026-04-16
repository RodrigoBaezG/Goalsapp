const { db, pgp } = require('./config');

const ALLOWED_TABLES = ['goals', 'accounts'];

function assertTable(table) {
    if (!ALLOWED_TABLES.includes(table)) {
        throw new Error(`Invalid table: ${table}`);
    }
}

function requestAllGoals(table, user_id, callback) {
    assertTable(table);
    return db.any('SELECT * FROM $1:name WHERE user_id = $2', [table, user_id])
        .then(data => callback(null, data))
        .catch(error => callback(error, null));
}

function request(table, id, callback) {
    assertTable(table);
    return db.any('SELECT * FROM $1:name WHERE id = $2', [table, id])
        .then(data => callback(null, data))
        .catch(error => callback(error, null));
}

function requestGoalByUser(id, user_id, callback) {
    return db.any('SELECT * FROM goals WHERE id = $1 AND user_id = $2', [id, user_id])
        .then(data => callback(null, data))
        .catch(error => callback(error, null));
}

function requestAccount(username, callback) {
    return db.any('SELECT * FROM accounts WHERE username = $1', [username])
        .then(data => callback(null, data))
        .catch(error => callback(error, null));
}

function create(table, data, callback) {
    assertTable(table);
    const cs = new pgp.helpers.ColumnSet(Object.keys(data), { table });
    const query = pgp.helpers.insert(data, cs) + ' RETURNING *';
    return db.one(query)
        .then(data => callback(null, data))
        .catch(error => callback(error, null));
}

function update(table, id, data, callback) {
    assertTable(table);
    const safeData = { ...data };
    delete safeData.id;
    delete safeData.user_id;

    const cs = new pgp.helpers.ColumnSet(Object.keys(safeData), { table });
    const query = pgp.helpers.update(safeData, cs) + pgp.as.format(' WHERE id = $1 RETURNING *', [id]);
    return db.one(query)
        .then(data => callback(null, data))
        .catch(error => callback(error, null));
}

function remove(table, id, callback) {
    assertTable(table);
    return db.none('DELETE FROM $1:name WHERE id = $2', [table, id])
        .then(() => callback(null))
        .catch(error => callback(error));
}

module.exports = { requestAllGoals, request, requestGoalByUser, create, update, remove, requestAccount };
