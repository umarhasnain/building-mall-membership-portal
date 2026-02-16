export default function BadgeCard({ level }) {

  const colors = {
    Starter: "bg-gray-500",
    Silver: "bg-slate-400",
    Gold: "bg-yellow-500",
    Platinum: "bg-purple-500",
  };

  return (
    <div className={`${colors[level]} text-white px-4 py-2 rounded-xl`}>
      {level} Member
    </div>
  );
}
