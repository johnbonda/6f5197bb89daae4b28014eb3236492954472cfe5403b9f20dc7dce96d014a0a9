module.exports = {
    name: "deplevels",
    fields: [
        {
            name: 'dlid',
            type: 'String',
            length: 255,
            primary_key: true
        },
        {
            name: 'did',
            type: 'String',
            length: 255,
        },
        {
            name: 'level',
            type: 'Number',
            length: 255
        }
    ]
}
