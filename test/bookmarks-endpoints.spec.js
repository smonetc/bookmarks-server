const knex = require('knex')
const { makeBookmarkArray } = require('./bookmarkfixtures')
const app = require('../src/app')


describe.only('Bookmarks Endpoints', () => {
    let db
  
    before('make knex instance', () => {
      db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
      })
      app.set('db', db)
    })
  
    after('disconnect from db', () => db.destroy())
  
    before('cleanup', () => db('bookmarks').truncate())
  
    afterEach('cleanup', () => db('bookmarks').truncate())
  
  
describe('Get /bookmarks Endpoint', function (){
    context('Given database is empty', () => {

        it(`responds with 200 and an empty list`, () => {
            return supertest(app)
              .get('/bookmarks')
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(200, [])
          })
    })
    context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarkArray()

        beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
            })

        it('gets the bookmarks from the store', () => {
        return supertest(app)
            .get('/bookmarks')
            .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
            .expect(200, testBookmarks)
        })
    })
})

describe('Get /bookmarks/:bookmark_id Endpoint', function (){
    context('Given no bookmarks', () => {

        it(`responds with 404 when bookmark doesn't exist`, () => {
            return supertest(app)
              .get('/bookmarks/123')
              .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
              .expect(404, {
                error: {message: 'Bookmark Not Found'}
              })
          })
    })
    context('Given there are bookmarks in the database', () => {
        const testBookmarks = makeBookmarkArray()

        beforeEach('insert bookmarks', () => {
            return db
                .into('bookmarks')
                .insert(testBookmarks)
            })

            it('GET /bookmarks/:bookmark_id responds with 200 and the specified bookmark', () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                return supertest(app)
                .get(`/bookmarks/${bookmarkId}`)
                .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
                .expect(200, expectedBookmark)
            })
    })
})








  })