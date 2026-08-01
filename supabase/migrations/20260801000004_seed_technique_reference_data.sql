do $$
declare
  v_sport_id uuid;
begin
  select id into v_sport_id from sports where name = 'Karate';

  insert into techniques (sport_id, name, category) values
    (v_sport_id, 'Anan', 'kata'), (v_sport_id, 'Anan Dai', 'kata'), (v_sport_id, 'Ananko', 'kata'),
    (v_sport_id, 'Aoyagi', 'kata'), (v_sport_id, 'Bassai', 'kata'), (v_sport_id, 'Bassai Dai', 'kata'),
    (v_sport_id, 'Bassai Sho', 'kata'), (v_sport_id, 'Chatanyara Kusanku', 'kata'),
    (v_sport_id, 'Chibana No Kushanku', 'kata'), (v_sport_id, 'Chinte', 'kata'), (v_sport_id, 'Chinto', 'kata'),
    (v_sport_id, 'Enpi', 'kata'), (v_sport_id, 'Fukyugata Ichi', 'kata'), (v_sport_id, 'Fukyugata Ni', 'kata'),
    (v_sport_id, 'Gankaku', 'kata'), (v_sport_id, 'Garyu', 'kata'), (v_sport_id, 'Gekisai (Geksai) 1', 'kata'),
    (v_sport_id, 'Gekisai (Geksai) 2', 'kata'), (v_sport_id, 'Gojushiho', 'kata'),
    (v_sport_id, 'Gojushiho Dai', 'kata'), (v_sport_id, 'Gojushiho Sho', 'kata'), (v_sport_id, 'Hakucho', 'kata'),
    (v_sport_id, 'Hangetsu', 'kata'), (v_sport_id, 'Haufa (Haffa)', 'kata'), (v_sport_id, 'Heian Shodan', 'kata'),
    (v_sport_id, 'Heian Nidan', 'kata'), (v_sport_id, 'Heian Sandan', 'kata'), (v_sport_id, 'Heian Yondan', 'kata'),
    (v_sport_id, 'Heian Godan', 'kata'), (v_sport_id, 'Heiku', 'kata'), (v_sport_id, 'Ishimine Bassai', 'kata'),
    (v_sport_id, 'Itosu Rohai Shodan', 'kata'), (v_sport_id, 'Itosu Rohai Nidan', 'kata'),
    (v_sport_id, 'Itosu Rohai Sandan', 'kata'), (v_sport_id, 'Jiin', 'kata'), (v_sport_id, 'Jion', 'kata'),
    (v_sport_id, 'Jitte', 'kata'), (v_sport_id, 'Juroku', 'kata'), (v_sport_id, 'Kanchin', 'kata'),
    (v_sport_id, 'Kanku Dai', 'kata'), (v_sport_id, 'Kanku Sho', 'kata'), (v_sport_id, 'Kanshu', 'kata'),
    (v_sport_id, 'Kishimoto No Kushanku', 'kata'), (v_sport_id, 'Kousoukun', 'kata'),
    (v_sport_id, 'Kousoukun Dai', 'kata'), (v_sport_id, 'Kousoukun Sho', 'kata'), (v_sport_id, 'Kururunfa', 'kata'),
    (v_sport_id, 'Kusanku', 'kata'), (v_sport_id, 'Kyan No Chinto', 'kata'), (v_sport_id, 'Kyan No Wanshu', 'kata'),
    (v_sport_id, 'Matsukaze', 'kata'), (v_sport_id, 'Matsumura Bassai', 'kata'), (v_sport_id, 'Matsumura Rohai', 'kata'),
    (v_sport_id, 'Meikyo', 'kata'), (v_sport_id, 'Myojo', 'kata'), (v_sport_id, 'Naifanchin Shodan', 'kata'),
    (v_sport_id, 'Naifanchin Nidan', 'kata'), (v_sport_id, 'Naifanchin Sandan', 'kata'), (v_sport_id, 'Naihanchi', 'kata'),
    (v_sport_id, 'Nijushiho', 'kata'), (v_sport_id, 'Nipaipo', 'kata'), (v_sport_id, 'Niseishi', 'kata'),
    (v_sport_id, 'Ohan', 'kata'), (v_sport_id, 'Ohan Dai', 'kata'), (v_sport_id, 'Oyadomari No Passai', 'kata'),
    (v_sport_id, 'Pachu', 'kata'), (v_sport_id, 'Paiku', 'kata'), (v_sport_id, 'Papuren', 'kata'),
    (v_sport_id, 'Passai', 'kata'), (v_sport_id, 'Pinan Shodan', 'kata'), (v_sport_id, 'Pinan Nidan', 'kata'),
    (v_sport_id, 'Pinan Sandan', 'kata'), (v_sport_id, 'Pinan Yondan', 'kata'), (v_sport_id, 'Pinan Godan', 'kata'),
    (v_sport_id, 'Rohai', 'kata'), (v_sport_id, 'Saifa', 'kata'), (v_sport_id, 'Sanchin', 'kata'),
    (v_sport_id, 'Sansai', 'kata'), (v_sport_id, 'Sanseiru', 'kata'), (v_sport_id, 'Sanseru', 'kata'),
    (v_sport_id, 'Seichin', 'kata'), (v_sport_id, 'Seienchin (Seiyunchin)', 'kata'), (v_sport_id, 'Seipai', 'kata'),
    (v_sport_id, 'Seiryu', 'kata'), (v_sport_id, 'Seishan', 'kata'), (v_sport_id, 'Seisan (Sesan)', 'kata'),
    (v_sport_id, 'Shiho Kousoukun', 'kata'), (v_sport_id, 'Shinpa', 'kata'), (v_sport_id, 'Shinsei', 'kata'),
    (v_sport_id, 'Shisochin', 'kata'), (v_sport_id, 'Sochin', 'kata'), (v_sport_id, 'Suparinpei', 'kata'),
    (v_sport_id, 'Tekki Shodan', 'kata'), (v_sport_id, 'Tekki Nidan', 'kata'), (v_sport_id, 'Tekki Sandan', 'kata'),
    (v_sport_id, 'Tensho', 'kata'), (v_sport_id, 'Tomari Bassai', 'kata'), (v_sport_id, 'Unshu', 'kata'),
    (v_sport_id, 'Unsu', 'kata'), (v_sport_id, 'Useishi', 'kata'), (v_sport_id, 'Wankan', 'kata'),
    (v_sport_id, 'Wanshu', 'kata');

  insert into techniques (sport_id, name, category) values
    (v_sport_id, 'Kizami tsuki → Gyaku tsuki', 'kumite_combo'),
    (v_sport_id, 'Kizami tsuki → Ura mawashi geri', 'kumite_combo'),
    (v_sport_id, 'Gyaku tsuki → Front leg mawashi geri', 'kumite_combo'),
    (v_sport_id, 'Double gyaku tsuki', 'kumite_combo'),
    (v_sport_id, 'Jodan gyaku tsuki → Chudan mawashi geri', 'kumite_combo'),
    (v_sport_id, 'Kizami tsuki → Gyaku tsuki → Ura mawashi geri (rear leg)', 'kumite_combo'),
    (v_sport_id, 'Gyaku tsuki (body) → Front leg mawashi geri jodan', 'kumite_combo'),
    (v_sport_id, 'Jodan age uke/Tate uke → Kizami mawashi geri → Chudan gyaku tsuki', 'kumite_combo'),
    (v_sport_id, 'Chudan mae geri + Gedan barai → Kizami tsuki/Tate tsuki', 'kumite_combo'),
    (v_sport_id, 'Kizami tsuki → Uraken yokomawashi uchi → Mae-ashi mawashi geri', 'kumite_combo'),
    (v_sport_id, 'Kizami tsuki', 'kumite_combo'), (v_sport_id, 'Gyaku tsuki', 'kumite_combo'),
    (v_sport_id, 'Ura tsuki', 'kumite_combo'), (v_sport_id, 'Mae geri', 'kumite_combo'),
    (v_sport_id, 'Mawashi geri', 'kumite_combo'), (v_sport_id, 'Ura mawashi geri', 'kumite_combo'),
    (v_sport_id, 'Ushiro geri', 'kumite_combo'), (v_sport_id, 'Yoko geri', 'kumite_combo'),
    (v_sport_id, 'Age uke', 'kumite_combo'), (v_sport_id, 'Soto uke', 'kumite_combo'),
    (v_sport_id, 'Uchi uke', 'kumite_combo'), (v_sport_id, 'Gedan barai', 'kumite_combo');
end $$;
