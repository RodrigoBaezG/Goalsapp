const db = require('./config');

function requestAllGoals(table, user_id, callback) {
    return db.any('SELECT * FROM $1:name WHERE user_id = $2', [table, user_id])
        .then(data => {
            callback(null, data);
        })
        .catch(error => {
            callback(error, null);
        }); 
};

function request(table, id, callback) {
    return db.any(`SELECT * FROM ${table} WHERE id = ${id}`)
        .then(data => {     
            callback(null, data);
        })
        .catch(error => {
            callback(error, null);
        }); 
};

function requestAccount(username, callback) {
    return db.any(`SELECT * FROM accounts WHERE username = '${username}'`)
        .then(data => {     
            callback(null, data);
        })
        .catch(error => {
            callback(error, null);
        }); 
};

function create(table, data, callback) {
    const keys = Object.keys(data);
    const properties = keys.join(', ');
    const placeholders = keys.map(key => `'${data[key]}'`).join(', ');
    return db.any(`INSERT INTO ${table} (${properties}) VALUES (${placeholders}) returning *`)
        .then(([data]) => {
            callback(null, data);
        })
        .catch(error => {
            callback(error, null);
        });
};

function update(table, id, data, callback) {
    const updates = Object.keys(data).map(key => `${key}='${data[key]}'`).join(', ');
    const sql = `UPDATE ${table} SET ${updates} WHERE id=${id} returning *`;
    return db.any(sql)
        .then(([data]) => {
            callback(null, data);
        })
        .catch(error => {
            callback(error, null);
        });
};

function remove(table, id, callback) {
   db.any(`DELETE FROM ${table} WHERE id = ${id}`)
        .then(() => {
            callback(null);   
        })
        .catch(error => {
            callback(error);
        });
};

module.exports = {
    requestAllGoals, 
    request,
    create,
    update,
    remove,
    requestAccount 
};