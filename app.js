

const mongoose = require('mongoose')

const bp = require('body-parser')

const cors = require('cors')

const dbconfig = require('./database/db')

const api = require('./routes/auth.routes')
const { propfind } = require('./routes/auth.routes')


//Mongoose connection
mongoose.Promise = global.Promise
mongoose.connect(db.dbconfig, {
    userNewUrlPassword: true,
    useUnifiedTopology: true
})
.then(()=> console.log('database connection'))
.catch((err)=> console.log('database not connected' + err))

//Express settings
const app = express()
app.use(bp.json())
app.use(bp.urlenconded({extended: true}))
app.use(cors())

app.use('/api', api)

//Define port
const PORT = process.env.PORT || 3000

const server = app.listen(PORT, ()=> console.log('Connected to port', PORT))


//Express error handling
app.use((req,res,next)=> {
    setImmeddiate(()=>{
        next(new Error('Something went wrong with the server'))
    })
})
app.use((err,req,res,next)=> {
    console.log(err.message)

    if(!err.statusCode) {
        err.statusCode = 500
    }

    res.status(err.statusCode).send(err.message)
})