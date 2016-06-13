'use strict';

const expect = require('./setup').expect;
const config = require('./setup').dbConfig;

const Sequelize = require('sequelize');
require('../index')(Sequelize);

const sequelize = new Sequelize(config.database, config.username, config.password, config);

describe('token plugin', function () {
	let Model = sequelize.define('Model', {
		name: Sequelize.STRING
	}, {
		useTokens: {
			typeA: true,
			typeB: true
		}
	}), instance;

	Model.associate(sequelize.models);

	beforeEach(function* () {
		yield sequelize.sync({force: true});

		instance = yield Model.create({ name: 'foo' });
	});

	it('should define associations', function () {
		expect(Model.associations.typeAToken).to.be.ok;
		expect(Model.associations.typeBToken).to.be.ok;
	});

	it('should define create/get/set methods', function () {
		expect(instance.createTypeAToken).to.be.a('function');
		expect(instance.getTypeAToken).to.be.a('function');
		expect(instance.setTypeAToken).to.be.a('function');
		expect(instance.createTypeBToken).to.be.a('function');
		expect(instance.getTypeBToken).to.be.a('function');
		expect(instance.setTypeBToken).to.be.a('function');
	});

	describe('should manage tokens', function () {
		let token, tokenB;

		beforeEach(function* () {
			token = yield instance.createTypeAToken();
			tokenB = yield instance.createTypeBToken();
		});

		it('should create token', function* () {
			expect(token.type).to.be.equal(`${Model.name}.typeAToken`);
			expect(token.foreignKey).to.be.equal(instance.id);
		});

		it('should get token', function* () {
			token = yield instance.getTypeAToken();

			expect(token.type).to.be.equal(`${Model.name}.typeAToken`);
			expect(token.foreignKey).to.be.equal(instance.id);
		});

		it('include token', function* () {
			instance = yield Model.findById(instance.id, {
				include: [{
					association: Model.associations.typeAToken
				}, {
					association: Model.associations.typeBToken
				}]
			});

			expect(instance.typeAToken.type).to.be.equal(`${Model.name}.typeAToken`);
			expect(instance.typeAToken.foreignKey).to.be.equal(instance.id);
		});
	});

	/**
	 * @TODO
	 */
	it.skip('should create token along with instance creation', function* () {
		instance = yield Model.create({
			name: 'Bar',
			typeAToken: {
				type: `${Model.name}.typeAToken`
			}
		}, {
			include: [{
				model: sequelize.models.Token,
				as: 'typeAToken'
			}]
		});
		expect(instance.typeAToken.type).to.be.equal(`${Model.name}.typeAToken`);
		expect(instance.typeAToken.foreignKey).to.be.equal(instance.id);
	});
});