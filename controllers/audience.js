const Player = require("../models/player")
const Coach = require("../models/coach")
const Main_Admin = require("../models/Main_Admin")
const Month = require("../models/month")


const create_month =async(req,res)=>{
    try{
    const {month , start, end, note}=req.body
    const new_month = new Month({month , start, end, note})
   await new_month.save()
    res.status(200).send(new_month)
}catch(e){res.status(500).send(e.message)}
}

const create_day = async (req, res) => {
    try {
      const month_id = req.params.month_id;
      const data = await Month.findById(month_id);
  
      if (!data) {
        return res.status(400).send("غير موجود");
      }
  
      const { day, date } = req.body;
  
  
      if (!Array.isArray(data.days)) {
        data.days = []; 
      }
  
     
      data.days.push({ day, date });
  
      
      await data.save();
  
      res.status(200).send(data);
    } catch (e) {
      res.status(500).send(e.message);
    }
  }
  


  const audience_for_players = async (req, res) => {
    try {
        const month_id = req.params.month_id;
        const day_id = req.params.day_id;
        const player_ids = req.body.player_ids

        if (!Array.isArray(player_ids) || player_ids.length === 0) {
            return res.status(400).send("قائمة معرفات اللاعبين غير صالحة");
        }

         const check_audience = await Month.find({ 'days.audience': false });
if(check_audience){

        const playersData = await Promise.all(
            player_ids.map(async (player_id) => {
                const player = await Player.findById(player_id);
                if (!player) {
                    throw new Error(`لا يوجد لاعب بالمعرف ${player_id}`);
                }
                return {
                    user_id: player._id,
                    user_name: player.name,
                    role: player.role
                };
            })
        );

      
        await Month.updateOne(
            {
                _id: month_id,
                'days._id': day_id
            },
            {
                $set: {
                    'days.$.audience': true
                },
                $addToSet: {
                    'days.$.attendees': { $each: playersData }
                }
            }
        );

        res.status(200).send({ message: 'تم تسجيل الحضور بنجاح' });
}else{ res.status(400).send({ message: 'تم تسجيل الحضور فى وقت سابق' });}
    } catch (e) {
        res.status(500).send(e.message);
    }
};



const getAttendees = async (req, res) => {
    try {
        const user = req.user;

        if (!user.Admin) {
            return res.status(400).send("لست ادمن");
        }

        const month_id = req.params.month_id;
        const day_id = req.params.day_id;

      
        const month = await Month.findOne(
            {
                _id: month_id,
                'days._id': day_id
            },
            {
                'days.$': 1
            }
        );

        if (!month || !month.days[0]) {
            return res.status(404).send("لم يتم العثور على بيانات اليوم");
        }

        const day = month.days[0];
        const attendees = day.attendees || [];

        
        const totalPlayers = await Player.countDocuments()
        const totalCoaches = await Coach.countDocuments()
        const totalUsers = totalPlayers + totalCoaches

        const numberOfAttendees = attendees.length
        const attendancePercentage = (numberOfAttendees / totalUsers) * 100;

        console.log(numberOfAttendees);
        console.log(attendancePercentage);

        res.status(200).send({
            message: 'تم استرجاع بيانات الحضور',
            number_of_attendees: numberOfAttendees,
            attendees_data: attendees,
            all_day_data: day,
            attendance_percentage: attendancePercentage.toFixed(2)
        });
    } catch (e) {
        res.status(500).send(e.message);
    }
};


const audience_for_coachs= async (req, res) => {
    try {
        const month_id = req.params.month_id;
        const day_id = req.params.day_id;
        const coach_ids = JSON.parse(req.body.coach_ids);  

        if (!Array.isArray(coach_ids) || coach_ids.length === 0) {
            return res.status(400).send("قائمة معرفات اللاعبين غير صالحة");
        }

         const check_audience = await Month.find({ 'days.audience': false });
if(check_audience){
       
        const coachsData = await Promise.all(
            coach_ids.map(async (coach_id) => {
                const coach = await Coach.findById(coach_id);
                if (!coach) {
                    throw new Error(`لا يوجد لاعب بالمعرف ${coach_id}`);
                }
                return {
                    user_id: coach._id,
                    user_name: coach.name,
                    role: coach.role
                };
            })
        );

   
        await Month.updateOne(
            {
                _id: month_id,
                'days._id': day_id
            },
            {
                $set: {
                    'days.$.audience': true
                },
                $addToSet: {
                    'days.$.attendees': { $each: coachsData }
                }
            }
        );

        res.status(200).send({ message: 'تم تسجيل الحضور بنجاح' });
}else{ res.status(400).send({ message: 'تم تسجيل الحضور فى وقت سابق' }) }
    } catch (e) {
        res.status(500).send(e.message);
    }
};



const delete_month =async(req,res)=>{
    try{
    
   const user = req.user
        if(user.Admin){
     const month_id = req.params.month_id
      if (!mongoose.Types.ObjectId.isValid(month_id)) {
        return res.status(404).send("ID is not correct!!");
      }
    const data = await Month.findById(month_id)
    if(!data){res.status(404).send("هذا الشهر غير موجود")}
     await Month.findByIdAndDelete(month_id);
    res.status(200).send(' تم حذف هذا الشهر بنجاح')
}else{return res.status(404).send('لست ادمن')}
    }catch(e){res.status(500).send(e.message)}
}

const get_all_month =async(req,res)=>{
    try{
    
   const user = req.user
        if(user.Admin){

     
    const data = await Month.find()
    if(!data){res.status(404).send("لا يوجد شهور")}
    
    res.status(200).send(data)
}else{return res.status(404).send('لست ادمن')}
    }catch(e){res.status(500).send(e.message)}
}


const get_month =async(req,res)=>{
    try{
    
   const user = req.user
        if(user.Admin){
const month_id = req.params.month_id
      if (!mongoose.Types.ObjectId.isValid(month_id)) {
        return res.status(404).send("ID is not correct!!");
      }
    const data = await Month.findById(month_id)
    if(!data){res.status(404).send("هذا الشهر غير موجود")}
    
    res.status(200).send(data)
}else{return res.status(404).send('لست ادمن')}
    }catch(e){res.status(500).send(e.message)}
}



const deleteDayById = async (req,res ) => {
  try {
      const month_id = req.params.month_id
      const day_id = req.params.day_id;
    const result = await Month.updateOne(
      { _id: month_id },
      { $pull: { days: { _id: day_id } } }
    );

    if (result.nModified > 0) {
      res.status(200).send(`تم حذف اليوم ذو المعرف ${day_id} من الشهر ذو المعرف ${month_id}.`);
    } else {
     return res.status(404).send(`لم يتم العثور على اليوم ذو المعرف ${day_id} في الشهر ذو المعرف ${month_id}.`);
    }
  } catch (err) {
    console.error('حدث خطأ:', err.message);
  }
};





module.exports={create_month ,create_day ,audience_for_players ,getAttendees,audience_for_coachs,delete_month,get_all_month,get_month,deleteDayById}
