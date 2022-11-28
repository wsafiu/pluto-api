module.exports ={
    conn: require('./connection'),
    UserRepository: require('./repository/user-repository'),
    OrderRepository: require('./repository/order-repository'),
    InvoiceRepository: require('./repository/invoice-repository'),
    BlockHashRepository: require('./repository/blockhash-repository'),
    SaleRepository: require('./repository/sale-repository')
}