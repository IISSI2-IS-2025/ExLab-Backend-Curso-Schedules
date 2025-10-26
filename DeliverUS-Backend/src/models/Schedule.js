import { Model } from 'sequelize'

const loadModel = (sequelize, DataTypes) => {
  class Schedule extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // Un horario pertenece a un restaurante
      Schedule.belongsTo(models.Restaurant, { foreignKey: 'restaurantId', as: 'restaurant' })

      // Un horario puede tener varios productos asociados
      Schedule.hasMany(models.Product, { foreignKey: 'scheduleId', as: 'products' })
    }
  }

  Schedule.init({
    startTime: {
      allowNull: false,
      type: DataTypes.TIME
    },
    endTime: {
      allowNull: false,
      type: DataTypes.TIME
    },
    restaurantId: {
      allowNull: false,
      type: DataTypes.INTEGER
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: new Date()
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: new Date()
    }
  }, {
    sequelize,
    modelName: 'Schedule'
  })

  return Schedule
}

export default loadModel
