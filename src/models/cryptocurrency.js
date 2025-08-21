import { DataTypes, Model } from "sequelize";

class Cryptocurrency extends Model {
  static initModel(sequelize) {
    Cryptocurrency.init(
      {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        symbol: { type: DataTypes.STRING, allowNull: false, unique: true },
        slug: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        modelName: "Cryptocurrency",
        tableName: "cryptocurrencies",
        timestamps: false,
      }
    );
    return Cryptocurrency;
  }

  static associate(models) {
    // Relación 1 a muchos con Price
    this.hasMany(models.Price, {
      foreignKey: "cryptocurrencyId",
      as: "prices",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
}

export default Cryptocurrency;