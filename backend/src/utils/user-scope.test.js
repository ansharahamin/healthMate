import test from 'node:test'
import assert from 'node:assert/strict'
import { requireAdmin } from '../middlewares/auth.middleware.js'
import { getUserScopeFilter, resolveCreateUserId } from './user-scope.js'

const userId = '507f1f77bcf86cd799439011'
const otherUserId = '507f191e810c19729de860ea'

test('regular users remain scoped to themselves even with another userId query', () => {
    const req = {
        user: { _id: userId, role: 'user' },
        query: { userId: otherUserId },
    }

    assert.deepEqual(getUserScopeFilter(req), { userId })
})

test('admins can query all users or filter to a valid user id', () => {
    const req = { user: { _id: userId, role: 'admin' }, query: {} }
    assert.deepEqual(getUserScopeFilter(req), {})

    req.query.userId = otherUserId
    assert.deepEqual(getUserScopeFilter(req), { userId: otherUserId })
    req.query.userId = 'not-an-id'
    assert.equal(getUserScopeFilter(req), null)
})

test('regular users cannot create records for another user', () => {
    const req = { user: { _id: userId, role: 'user' } }
    assert.deepEqual(resolveCreateUserId(req), { userId })
    assert.deepEqual(resolveCreateUserId(req, otherUserId), {
        error: 'You cannot create records for another user.',
    })
})

test('admins can assign new records to a valid user id', () => {
    const req = { user: { _id: userId, role: 'admin' } }
    assert.deepEqual(resolveCreateUserId(req, otherUserId), { userId: otherUserId })
    assert.deepEqual(resolveCreateUserId(req), { userId })
})

test('admin middleware rejects regular users and allows admins', () => {
    const invoke = (role) => {
        const result = { statusCode: 200, body: null, nextCalled: false }
        const res = {
            status(statusCode) {
                result.statusCode = statusCode
                return this
            },
            json(body) {
                result.body = body
                return this
            },
        }
        requireAdmin({ user: { role } }, res, () => {
            result.nextCalled = true
        })
        return result
    }

    assert.deepEqual(invoke('user'), {
        statusCode: 403,
        body: { message: 'Forbidden.' },
        nextCalled: false,
    })
    assert.deepEqual(invoke('admin'), {
        statusCode: 200,
        body: null,
        nextCalled: true,
    })
})
