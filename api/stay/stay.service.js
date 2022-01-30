const dbService = require('../../services/db.service');
const ObjectId = require('mongodb').ObjectId;
const asyncLocalStorage = require('../../services/als.service');

async function query(filterOptions = {}) {
    try {
        // const dudu = (Object.keys(filterOptions).length) ? filterOptions : {};
        // const criteria = (Object.keys(dudu).length) ? _buildCriteria(dudu) : dudu;
        const criteria = _buildCriteria(filterOptions);
        // console.log(criteria);
        const collection = await dbService.getCollection('stay');
        const stays = await collection.find(criteria).toArray();
        // console.log(stays);
        return stays
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }

}

function _buildCriteria(params) {
    let criteria = {}
    if (params.location) {
        const regex = new RegExp(params.location, 'i')
        criteria = {
            $or: [
                { 'loc.address': { $regex: regex } },
                { 'loc.country': { $regex: regex } },
                { 'name': { $regex: regex } }
            ]
        }
    }
    if (params.guestsCount) {
        criteria.capacity = { $gte: +params.guestsCount };
    }
    return criteria;
}

async function getStayById(stayId) {
    try {
        const collection = await dbService.getCollection('stay');
        const stay = await collection.findOne({ _id: ObjectId(stayId) });
        return stay
    } catch (err) {
        logger.error(`while finding user ${stayId}`, err)
        throw err
    }
}


async function update(stay) {
    try {
        stay._id = ObjectId(stay._id)
        const collection = await dbService.getCollection('stay')
        await collection.updateOne({ _id: stay._id }, { $set: stay })
        return stay
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}
async function remove(stayId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId, isAdmin } = store
        const collection = await dbService.getCollection('stay')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(stayId) }
        if (!isAdmin) criteria.byUserId = ObjectId(userId)
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove stay ${stayId}`, err)
        throw err
    }
}


async function add(stay) {
    try {
        stay.host._id = ObjectId(stay.host._id)
        const collection = await dbService.getCollection('stay')
        await collection.insertOne(stay)
        return stay;
    } catch (err) {
        logger.error('cannot insert stay', err)
        throw err
    }
}

module.exports = {
    query,
    remove,
    update,
    add,
    getStayById

}


