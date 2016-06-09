'use strict';

const expect = require('./setup').expect;
const config = require('./setup').dbConfig;

const Sequelize = require('sequelize');
const sequelize = new Sequelize(config.database, config.username, config.password, config);

const Token = sequelize.import('../lib/token.model');

describe('token model', function () {
	beforeEach(function* () {
		yield sequelize.drop();
		yield sequelize.sync();
	});

	it('is a [constructor] function', function () {
		expect(Token).to.be.a('object');
	});

	it('can be created', function* () {
		let token = yield Token.create({
			type: 'test',
			expires: new Date(Date.now() + 100000),
			foreignKey: 100
		});

		expect(token).to.be.object;
		expect(token.id).to.be.number;
		expect(token.token).to.have.length(36); // uuid.v4
		expect(token.foreignKey).to.equals(100);
		expect(token.deactivatedAt).to.be.null;

		let savedToken = yield Token.findById(token.id);

		expect(savedToken).to.be.object;
		expect(savedToken.id).to.equals(token.id);
		expect(savedToken.token).to.equals(token.token);
		expect(savedToken.foreignKey).to.equals(token.foreignKey);
		expect(savedToken.deactivatedAt).to.equals(token.deactivatedAt);
	});

	describe('existing token', function () {
		let token;

		beforeEach(function* () {
			token = yield Token.create({
				type: 'test',
				foreignKey: 100
			});
		});

		it('active token can be deactivated', function* () {
			expect(token.isActive()).to.be.true;

			yield token.deactivate().save();

			expect(token.isActive()).to.be.false;

			let savedToken = yield Token.findById(token.id);

			expect(savedToken.isActive()).to.be.false;
		});

		it('expires', function* () {
			expect(token.isActive(Date.now())).to.be.true;
			expect(token.isActive(new Date(token.expires.getTime() + 1))).to.be.false;
		});
	});
});
