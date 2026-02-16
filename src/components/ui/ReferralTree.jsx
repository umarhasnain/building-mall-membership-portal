"use client";

import Tree from "react-d3-tree";

export default function ReferralTree({ member }) {

  const buildTree = () => {
    return {
      name: member.name,
      children:
        member.referrals?.map((r) => ({
          name: r.name || "Member",
        })) || [],
    };
  };

  return (
    <div className="w-full h-[400px] bg-white/10 rounded-3xl p-4">
      <Tree
        data={buildTree()}
        orientation="vertical"
        translate={{ x: 300, y: 80 }}
      />
    </div>
  );
}
