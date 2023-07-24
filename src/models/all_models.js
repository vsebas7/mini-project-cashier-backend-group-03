import db from "./index.js";

export const Category = db.sequelize.define("categories", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    parent: {
        type : db.Sequelize.INTEGER,
        allowNull : false
    },
    status: {
        type : db.Sequelize.STRING(45),
        allowNull : false,
        defaultValue: 'available'
    }
},
{ timestamps: false }
);

export const Product = db.sequelize.define("products", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    price: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    stock: {
        type: db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue: 1
    },
    categoryId : {
        type : db.Sequelize.INTEGER,
        allowNull : false,
    },
    description: {
        type : db.Sequelize.TEXT('medium'),
        allowNull : false
    },
    image : {
        type : db.Sequelize.TEXT('medium'),
        allowNull : true,
    },
    status : {
        type : db.Sequelize.STRING(45),
        allowNull : false,
        defaultValue: "ready stock"
    },
    
},
{ timestamps: false }
)

export const Role = db.sequelize.define("roles",{
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: db.Sequelize.STRING(45),
        allowNull: false
    }
},
{ timestamps: false }
)

export const Transaction = db.sequelize.define("transaction",{
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    created_at:{
        type: db.Sequelize.TIME
    },
    userId: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    total_price: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    status: {
        type: db.Sequelize.STRING(45),
        allowNull: false,
        defaultValue: "on process"
    },
},
{timestamps: false}
)

export const Items = db.sequelize.define("transaction_items",{
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    invoice: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    transactionId: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    productId: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
    qty: {
        type: db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue: 1
    },
    total_price: {
        type: db.Sequelize.INTEGER,
        allowNull : false
    },
},
{timestamps: false}
)

export const User = db.sequelize.define("users", {
    id: {
        type: db.Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    username: {
        type: db.Sequelize.STRING(45),
        allowNull: false
    },
    email: {
        type : db.Sequelize.STRING(45),
        allowNull : false
    },
    password: {
        type: db.Sequelize.TEXT('long'),
        allowNull : false
    },
    image : {
        type : db.Sequelize.TEXT('long'),
        allowNull : true
    },
    roleId: {
        type: db.Sequelize.INTEGER,
        allowNull : false,
        defaultValue: 0
    },
    status : {
        type : db.Sequelize.STRING(45),
        allowNull : false,
        defaultValue : "user"
    },
    token : {
        type : db.Sequelize.TEXT("long"),
        allowNull : true,
    },
    expired_token : {
        type : db.Sequelize.TIME,
        allowNull : true,
    },
},
{ timestamps: false }
)

Role.hasMany(User);

User.belongsTo(Role, {foreignKey : 'roleId'});
User.hasMany(Transaction);

Transaction.belongsTo(User, {foreignKey : 'userId'});
Transaction.hasMany(Items);

Items.belongsTo(Transaction, {foreignKey : 'transactionId'});
Items.belongsTo(Product, {foreignKey : 'productId'});

Product.hasMany(Items);
Product.belongsTo(Category, {foreignKey : 'categoryId'});

Category.hasMany(Product);
Category.belongsTo(Category, {foreignKey : 'parent'});
