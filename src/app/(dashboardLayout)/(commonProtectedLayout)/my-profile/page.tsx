import MyProfile from "@/components/modules/MyProfile/MyProfile";
import { getUserInfo } from "@/services/auth/getUserInfo";
import { redirect } from "next/navigation";

const MyProfilePage = async () => {
  const userInfo = await getUserInfo();
  if (!userInfo) redirect('/login');
  return <MyProfile userInfo={userInfo} />;
};

export default MyProfilePage;