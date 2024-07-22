const express = require('express')
const router = express.Router()

const storage = require("../middleware/multer_upload")
const { coach_auth , admin_auth} = require('../middleware/auth')
  
const {
    create_mainadmin,create_player,create_coach,login,getAllPlayer,
    get_coach_Player,
    loginOut,getPlayer,getCoach,accessAdmin,unaccessAdmin,deletePlayer,deleteAllPlayers,
    deleteCoach,deleteAllCoachs,editPlayer,
    editCoach,getAllCoach
  } = require('../controllers/user')


  router.post("/create_mainadmin",create_mainadmin)
  router.post("/create_player",storage.any(),create_player)
  router.post("/create_coach",storage.any(),admin_auth,create_coach)

  router.post("/login",login)


  router.get("/admin/get_all_player",admin_auth,getAllPlayer)
  router.get("/admin/get_all_coach",admin_auth,getAllCoach)

  router.get("/get_player/:player_id",getPlayer)
  router.get("/admin/get_coach/:coach_id",admin_auth,getCoach)
  router.patch("/admin/access_admin/:coach_id",admin_auth,accessAdmin)
  router.patch("/admin/un_access_admin/:coach_id",admin_auth,unaccessAdmin)

  router.get("/get_coach_Player/:player_id",coach_auth,get_coach_Player)

  router.delete("/delete_player/:player_id",admin_auth,deletePlayer)
  router.delete("/delete_all_player",admin_auth,deleteAllPlayers)
  router.delete("/admin/delete_coach/:coach_id",admin_auth,deleteCoach)
  router.delete("/admin/delete_all_coach",admin_auth,deleteAllCoachs)


  router.put("/edit_player/:player_id",storage.any(),admin_auth,editPlayer)
  
  router.put("/edit_coach/:coach_id",storage.any(),admin_auth,editCoach)


  router.delete("/login_Out",loginOut)



  module.exports = router;