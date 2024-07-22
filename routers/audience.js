const express = require('express')
const router = express.Router()

const { admin_auth} = require('../middleware/auth')
  
const {
    create_month ,create_day ,audience_for_players ,audience_for_coachs,getAttendees,delete_month,get_all_month,get_month
  } = require('../controllers/audience')


  router.post("/create_month",create_month)
  router.post("/create_day/:month_id",create_day)
  router.post("/audience_for_players/:month_id/:day_id",audience_for_players)
  router.post("/admin/audience_for_coach/:month_id/:day_id",admin_auth,audience_for_coachs)
  router.get("/get_audience/:month_id/:day_id",admin_auth,getAttendees)
  router.get("/get_all_month",admin_auth,get_all_month)
router.get("/get_month/:month_id",admin_auth,get_month)
 router.delete("/delete_month/:month_id",admin_auth,delete_month)

  module.exports = router;
