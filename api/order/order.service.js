const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query() {
    try {
        const collection = await dbService.getCollection('order')
        let orders = await collection.aggregate([
            {
                $lookup:
                {
                    localField: 'buyerId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'buyer'
                }
            },
            {
                $unwind: '$buyer'
            },
            {
                $lookup:
                {
                    localField: 'stayId',
                    from: 'stay',
                    foreignField: '_id',
                    as: 'stay'
                }
            },
            {
                $unwind: '$stay'
            },
            {
                $lookup:
                {
                    localField: 'hostId',
                    from: 'user',
                    foreignField: '_id',
                    as: 'host'
                }
            },
            {
                $unwind: '$host'
            }
        ]).toArray()
        console.log(orders.length)
        orders = orders.sort((a, b) => {
            const aId = a._id
            const bId = b._id
            if (aId < bId) return 1
            else if (aId > bId) return -1
            else return 0
        })
        orders = orders.map(order => {
            order.buyer = { _id: order.buyer._id, fullName: order.buyer.fullName };
            order.stay = { _id: order.stay._id, price: order.stay.price, name: order.stay.name }
            order.host = { _id: order.host._id, name: order.host.fullName }
            delete order.buyerId;
            delete order.stayId;
            delete order.hostId;
            return order
        })
        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }

}

async function update(order) {
    try {
        order._id = ObjectId(order._id)
        order.hostId = ObjectId(order.host._id)
        order.stayId = ObjectId(order.stay._id)
        order.buyerId = ObjectId(order.buyer._id)
        delete order.buyer
        delete order.stay
        delete order.host
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ _id: order._id }, { $set: order })
        return order;
    } catch (err) {
        logger.error(`cannot update user ${order._id}`, err)
        throw err
    }
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order');
        const stay = await collection.findOne({ _id: ObjectId(orderId) });
        return stay
    } catch (err) {
        logger.error(`while finding user ${orderId}`, err)
        throw err
    }
}

async function remove(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const criteria = { _id: ObjectId(orderId) }
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}


async function add(order) {
    try {
        const orderToAdd = {
            hostId: ObjectId(order.hostId),
            buyerId: ObjectId(order.buyerId),
            stayId: ObjectId(order.stayId),
            totalPrice: order.totalPrice,
            startDate: order.startDate,
            endDate: order.endDate,
            guests: order.guests,
            status: order.status
        }
        const collection = await dbService.getCollection('order')
        await collection.insertOne(orderToAdd)
        return orderToAdd;
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                email: txtCriteria
            },
            {
                fullName: txtCriteria
            }
        ]
    }
    if (filterBy.minBalance) {
        criteria.score = { $gte: filterBy.minBalance }
    }
    return criteria
}

module.exports = {
    query,
    remove,
    add,
    getById,
    update
}


