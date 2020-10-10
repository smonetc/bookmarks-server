const express = require('express')
const uuid = require('uuid/v4')
const {isWebUri}= require('valid-url')
const logger = require('../logger')
const store = require('../store')
const BookmarksService = require('./bookmarks-service')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: bookmark.title,
  url: bookmark.url,
  description: bookmark.description,
  rating: Number(bookmark.rating)
})

bookmarkRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    BookmarksService.getAllBookmarks(req.app.get('db'))
    .then(bookmark => {
      res.json(bookmark.map(serializeBookmark))
    })
    .catch(next)
  })
  .post(bodyParser, (req, res) => {
    const {title,url,description,rating} = req.body

    if(!title){
        logger.error('Title is required')
        return res
            .status(400)
            .send('Invalid data')
    }

    if(!url){
        logger.error('URL is required')
        return res
            .status(400)
            .send('Invalid data')
    }

    if(!description){
        logger.error('Description is required')
        return res
            .status(400)
            .send('Invalid data')
    }

    if(!rating){
        logger.error('Rating is required')
        return res
            .status(400)
            .send('Invalid data')
    }

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
        logger.error(`Invalid rating '${rating}' supplied`)
        return res.status(400).send(`'rating' must be a number between 0 and 5`)
    }

    if(!isWebUri(url)){
        logger.error(`Invalid url '${url}' supplied`)
        return res.status(400).send(`must input valid 'url`)
    }

    const bookmark = {id: uuid(),title,url,description,rating}

    store.bookmarks.push(bookmark)

    logger.info(`Bookmark with ${bookmark.id} created`)

    res
    .status(201)
    .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
    .send(bookmark)
  })

bookmarkRouter
  .route('/bookmarks/:bookmark_id')
  .get((req, res, next) => {
    const { bookmark_id } = req.params 
    BookmarksService.getById(req.app.get('db'), bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${bookmark_id} not found.`);
          return res
            .status(404)
            .json({
              error: {message: 'Bookmark Not Found'}
            })
        }
        res.json(serializeBookmark(bookmark))
      })
      .catch(next)
  })
  .delete((req, res) => {
    const { bookmark_id } = req.params;

    const bookmarkIndex = store.bookmarks.findIndex(b => b.id == bookmark_id);
  
    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`);
      return res
        .status(404)
        .send('Not found');
    }
  
    store.bookmarks.splice(bookmarkIndex, 1);
  
    logger.info(`Card with id ${bookmark_id} deleted.`);
  
    res
      .status(204)
      .end()
  })

module.exports = bookmarkRouter