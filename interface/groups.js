var logger = require("../utils/logger");
var SuperDappCall = require("../utils/SuperDappCall")


// inputs: limit, offset
app.route.post('/issuers', async function(req, cb){
    logger.info("Entered /issuers API");
    var total = await app.model.Issuer.count({
        deleted: '0'
    });
    var result = await app.model.Issuer.findAll({
        condition: {
            deleted: '0'
        },
        limit: req.query.limit,
        offset: req.query.offset
    });
    return {
        total: total,
        issuers: result
    }; 
});

app.route.post('/issuers/data', async function(req, cb){
    logger.info("Entered /issuers/data API");
    var result = await app.model.Issuer.findOne({
        condition: {
            email: req.query.email
        }
    });
    if(!result) return "Invalid Issuer";
    return result;
});

// inputs: limit, offset
app.route.post('/authorizers', async function(req, cb){
    logger.info("Entered /authorizers API");
    var total = await app.model.Authorizer.count({
        deleted: '0'
    });
    var result = await app.model.Authorizer.findAll({
        condition: {
            deleted: '0'
        },
        limit: req.query.limit,
        offset: req.query.offset
    });
    return {
        total: total,
        authorizer: result
    }; 
});

app.route.post('/authorizers/data', async function(req, cb){
    logger.info("Entered /authoirzers/data");
    var result = await app.model.Authorizer.findOne({
        condition: {
            email: req.query.email
        }
    });
    if(!result) return "Invalid Authorizer";
    return result;
});

app.route.post('/authorizers/getId', async function(req, cb){
    var result = await app.model.Authorizer.findOne({
        condition:{
            email: req.query.email
        }
    });
    if(result){
        return {
            isSuccess: true,
            result: result
        }
    }
    return {
        isSuccess: false,
        message: "Authorizer not found"
    }
})

app.route.post('/employees/getId', async function(req, cb){
    var result = await app.model.Employee.findOne({
        condition:{
            email: req.query.email
        }
    });
    if(result){
        return {
            isSuccess: true,
            result: result
        }
    }
    return {
        isSuccess: false,
        message: "Employee not found"
    }
})

app.route.post('/issuers/getId', async function(req, cb){
    var result = await app.model.Issuer.findOne({
        condition:{
            email: req.query.email
        }
    });
    if(result){
        return {
            isSuccess: true,
            result: result
        }
    }
    return {
        isSuccess: false,
        message: "Issuer not found"
    }
})

app.route.post('/authorizers/remove', async function(req, cb){
    logger.info("Entered /authorizers/remove API");
    var check = await app.model.Authorizer.findOne({
        condition:{
            aid:req.query.aid,
            deleted: '0'
        }
    });
    if(!check) return {
        message: "Not found",
        isSuccess: false
    }
    var removeObj = {
        email: check.email,
    }
    var removeInSuperDapp = await SuperDappCall.call('POST', '/removeUsers', removeObj);
    if(!removeInSuperDapp) return {
        message: "No response from superdapp",
        isSuccess: false
    }
    if(!removeInSuperDapp.isSuccess) return {
        message: "Failed to delete",
        err: removeInSuperDapp,
        isSuccess: false
    }
    var pendingIssues = await app.model.Issue.findAll({
        condition: {
            status: {
                $in: ['pending', 'authorized']
            },
            category: check.category
        },
        fields: ['pid', 'count']
    });

    var countOfAuths = await app.model.Authorizer.count({
        category: check.category
    });

    for(i in pendingIssues){
        if(pendingIssues[i].count === countOfAuths - 1) app.sdb.update('issue', {status: 'authorized'}, {pid: pendingIssues[i].pid});
        else app.sdb.update('issue', {count: pendingIssues[i].count - 1}, {pid: pendingIssues[i].pid});
    }

    app.sdb.update('authorizer', {deleted: '1'}, {aid: check.aid});

    return {
        isSuccess: true
    };
});

app.route.post('/issuers/remove', async function(req, cb){
    logger.info("Entered /issuers/remove API");
    var check = await app.model.Issuer.findOne({
        condition:{
            iid:req.query.iid,
            deleted: '0'
        }
    });
    if(!check) return {
        message: "Not found",
        isSuccess: false
    }
    var removeObj = {
        email: check.email
    }
    var removeInSuperDapp = await SuperDappCall.call('POST', '/removeUsers', removeObj);
    if(!removeInSuperDapp) return {
        message: "No response from superdapp",
        isSuccess: false
    }
    if(!removeInSuperDapp.isSuccess) return {
        message: "Failed to delete",
        err: removeInSuperDapp,
        isSuccess: false
    }
    
    app.sdb.update('issuer', {deleted: '1'}, {iid: check.iid});

    return {
        isSuccess: true
    };
});

// app.route.post('/payslips/pendingsigns', async function(req, cb){
//     var check = await app.model.Ui.exists({
//         id: req.query.id
//     });
//     if(!check) return "Invalid id";
//     var signs = await app.model.Cs.findAll({
//         condition: {
//             upid: req.query.id
//         },fields: ['aid']
//     });
//     var totalAuthorizers=await app.model.Authorizer.findAll({fields: ['id']
//     });
//     var obj={
//         signs:signs.length,
//         totalAuthorizers:totalAuthorizers.length
//     }
//     return obj;
// });
