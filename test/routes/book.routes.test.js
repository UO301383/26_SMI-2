const app = require('../../app/app');
const chai = require('chai');
const expect = require('chai').expect;
const utils = require('./utils');

chai.use(require('chai-http'));
chai.use(require('chai-arrays'));

const BOOK_URI = '/books';


describe('Get books: ', () => {

    /**
     * Populate database with some data before all the tests in this suite.
     */
    before(async () => {        
        await utils.populateBooks();
    });

    /**
     * This is run once after all the tests.
     */
    after(async () => {
        await utils.dropBooks();
    });

    /**
     * Get all books correctly
     */
    it('should get all books', (done) => {
        chai.request(app)
            .get(BOOK_URI)
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body).to.be.array();
                expect(res.body.length).to.equal(2);
                done();
            });
    });

    /**
     * Get an existing book correctly
     */
    it('should get a book', (done) => {
        chai.request(app)
            .get(BOOK_URI + '/2')
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res).to.be.json;
                expect(res.body.id).to.be.equal(2);
                expect(res.body.title).to.be.equal('La vida es sueño');
                expect(res.body.author).to.be.equal('Calderón de la Barca');
                done();
            });
    });
});


describe('Create books: ', () => {

    /**
     * Populate database with some data before all the tests in this suite.
     */
    before(async () => {        
        await utils.populateBooks();
    });

    /**
     * This is run once after all the tests.
     */
    after(async () => {
        await utils.dropBooks();
    });

    /**
     * A book should be created correctly
     */
    it('should create a valid book', (done) => {
        const title = "Harry Potter y la piedra filosofal";
        const author = "J.K. Rowling";
        chai.request(app)
            .post(BOOK_URI)
            .send({ title: title, author: author })
            .end((err, res) => {
                expect(res).to.have.status(201);
                expect(res).to.be.json;
                expect(res.body.title).to.be.equal(title);
                expect(res.body.author).to.be.equal(author);
                expect(res.body.id).to.be.equal(3);
                done();
            });
    });

    /**
     * An invalid title should raise an error
     */
    it('should receive an error with an invalid title', (done) => {
        chai.request(app)
            .post(BOOK_URI)
            .send({ title:"", author: "Unknown" })
            .end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
    });

    /**
     * A missing title should raise an error
     */
    it('should receive an error with missing name', (done) => {
        chai.request(app)
            .post(BOOK_URI)
            .send({ author: "Unknown" })
            .end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
    });

    /**
     * An invalid author should raise an error
     */
    it('should receive an error with an invalid author', (done) => {
        chai.request(app)
            .post(BOOK_URI)
            .send({ title:"A valid title", author: "No" })
            .end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
    });

    /**
     * A missing author should raise an error
     */
    it('should receive an error with missing author', (done) => {
        chai.request(app)
            .post(BOOK_URI)
            .send({ title: "A valid title" })
            .end((err, res) => {
                expect(res).to.have.status(422);
                done();
            });
    });
});