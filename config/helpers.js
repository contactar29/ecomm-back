const MySqli = require('mysqli');

let conn = new MySqli({
    host:'localhost',
    port: 3307,
    user: 'user01',
    passwd : 'U$er1234',
    db: 'shop-db'
});

let db = conn.emit();

module.exports = {
    database: db
};