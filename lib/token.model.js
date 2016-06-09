'use strict';

const defaultTokenTTL = 24 * 60 * 60 * 1000;

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('Token', {
		type: {
			type: DataTypes.STRING,
			allowNull: false
		},
		foreignKey: {
			type: DataTypes.INTEGER,
			allowNull: false
		},
		token: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			allowNull: false
		},
		ttl: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: defaultTokenTTL
		},
		ttlSec: {
			type: DataTypes.VIRTUAL,
			get: function () {
				return this.ttl / 1000;
			},
			set: function (ttlSec) {
				this.ttl = ttlSec * 1000;
			}
		},
		ttlMin: {
			type: DataTypes.VIRTUAL,
			get: function () {
				return this.ttlSec / 60;
			},
			set: function (ttlMin) {
				this.ttlSec = ttlMin * 60;
			}
		},
		ttlHours: {
			type: DataTypes.VIRTUAL,
			get: function () {
				return this.ttlMin / 60;
			},
			set: function (ttlHours) {
				this.ttlMin = ttlHours * 60;
			}
		},
		ttlDays: {
			type: DataTypes.VIRTUAL,
			get: function () {
				return this.ttlHours / 24;
			},
			set: function (ttlDays) {
				this.ttlMin = ttlDays * 24;
			}
		},
		expires: {
			type: DataTypes.VIRTUAL,
			get: function () {
				if (this.ttl === 0) {
					return null; // never expires
				}
				return new Date(this.createdAt.getTime() + this.ttl);
			}
		},
		deactivatedAt: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		timestamps: true,
		instanceMethods: {
			deactivate: function () {
				this.deactivatedAt = Date.now();
				return this;
			},

			isExpired: function (atDate) {
				let expires = this.expires;

				atDate = atDate || Date.now();

				if (expires === null) {
					return false;
				}

				return expires < atDate;
			},

			isActive: function (atDate) {
				atDate = atDate || Date.now();

				return !this.isExpired(atDate) && (!this.deactivatedAt || this.deactivatedAt > atDate);
			}
		}
	});
};