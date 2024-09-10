const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', () => {

    suite('Solve a puzzle with...', () => {
        test('valid puzzle string', (done) => {
            chai.request(server)
                .post('/api/solve')
                .send({
                    puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, 'solution');
                    assert.isNotEmpty(res.body.solution);
                    done();
                });
        });

        test('missing puzzle string', (done) => {
            chai.request(server)
                .post('/api/solve')
                .send({})
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'Required field missing');
                    done();
                });
        });

        test('invalid characters', (done) => {
            chai.request(server)
                .post('/api/solve')
                .send({
                    puzzle: '1.5..2.84..63.12.7.Z..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.Z7.'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'Invalid characters in puzzle');
                    done();
                });
        });

        test('incorrect length', (done) => {
            chai.request(server)
                .post('/api/solve')
                .send({
                    puzzle: '1.5..2.84..63.12.7.'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
                    done();
                });
        });

        test('that cannot be solved', (done) => {
            chai.request(server)
                .post('/api/solve')
                .send({
                    puzzle: '9.9..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'Puzzle cannot be solved');
                    done();
                });
        });
    });

    suite('Check a puzzle placement with...', () => {
        test('all fields', (done) => {
            chai.request(server)
                .post('/api/check')
                .send({
                    puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                    coordinate: 'A2',
                    value: '3'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isTrue(res.body.valid);
                    done();
                });
        });

        test('single placement conflict', (done) => {
            chai.request(server)
                .post('/api/check')
                .send({
                    puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                    coordinate: 'A2',
                    value: '2'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isFalse(res.body.valid);
                    assert.include(res.body.conflict, 'row' || 'column' || 'region');
                    done();
                });
        });

        test('multiple placement conflicts', (done) => {
            chai.request(server)
                .post('/api/check')
                .send({
                    puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                    coordinate: 'A3',
                    value: '2'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isFalse(res.body.valid);
                    assert.isArray(res.body.conflict);
                    assert.include(res.body.conflict, 'row');
                    assert.include(res.body.conflict, 'column');
                    assert.include(res.body.conflict, 'region');
                    done();
                });
        });

        test('all placement conflicts', (done) => {
            chai.request(server)
                .post('/api/check')
                .send({
                    puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                    coordinate: 'A1',
                    value: '2'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isFalse(res.body.valid);
                    assert.sameMembers(res.body.conflict, ['row', 'column', 'region']);
                    done();
                });
        });

        test('missing required fields', (done) => {
            chai.request(server)
                .post('/api/check')
                .send({})
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'Required field(s) missing');
                    done();
                });
        });

        test('invalid characters', (done) => {
            chai.request(server)
                .post('/api/check')
                .send({
                    puzzle: '1.5..2.84..63.12.7.Z..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.Z7.',
                    coordinate: 'A2',
                    value: '3'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'Invalid characters in puzzle');
                    done();
                });
        });

        test('incorrect length', (done) => {
            chai.request(server)
                .post('/api/check')
                .send({
                    puzzle: '1.5..2.84..63.12.7.',
                    coordinate: 'A2',
                    value: '3'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
                    done();
                });
        });

        test('invalid placement coordinate', (done) => {
            chai.request(server)
                .post('/api/check')
                .send({
                    puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                    coordinate: 'Z9',
                    value: '3'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'Invalid coordinate');
                    done();
                });
        });

        test('invalid placement value', (done) => {
            chai.request(server)
                .post('/api/check')
                .send({
                    puzzle: '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.',
                    coordinate: 'A2',
                    value: '0'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.property(res.body, 'error');
                    assert.equal(res.body.error, 'Invalid value');
                    done();
                });
        });
    });
});

