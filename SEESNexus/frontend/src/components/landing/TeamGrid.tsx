import React from "react";
import { Link } from "react-router-dom";
import { UserCircle2 } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { Button } from "../ui/Button";

interface TeamMember {
  name: string;
  role: string;
  avatarUrl?: string;
}

// No real names/photos confirmed yet — generic avatar + role label until
// real contributor info is added. Set avatarUrl on an entry to swap in a photo.
const PLACEHOLDER_TEAM: TeamMember[] = [
  {
    name: "John Doe",
    role: "Frontend Lead",
    avatarUrl: "/team/ororo.jpg",
  },
  { name: "Doe John", role: "Backend Lead" },
  { name: "Team Member", role: "Hardware Lead" },
  { name: "Team Member", role: "Design Lead" },
  { name: "Team Member", role: "Community Lead" },
];

interface TeamGridProps {
  members?: TeamMember[];
}

export const TeamGrid: React.FC<TeamGridProps> = ({
  members = PLACEHOLDER_TEAM,
}) => {
  return (
    <section className="py-20 bg-sees-void">
      <div className="max-w-6xl mx-auto px-6 md:px-8 text-center">
        <span className="text-[10px] font-black uppercase tracking-widest text-sees-mustard mb-2 block">
          The People Behind It
        </span>
        <h2 className="text-2xl md:text-4xl font-black text-white mb-12">
          Built by SEES Engineers
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 mb-12">
          {members.map((member, i) => (
            <GlassCard key={i} className="!p-0 overflow-hidden text-center">
              {/* Fallback icon always renders underneath; a broken photo just hides
                  itself on error, same pattern as the project cards' thumbnails. */}
              <div className="aspect-square w-full relative flex items-center justify-center bg-sees-teal/20 overflow-hidden">
                <UserCircle2 className="w-16 h-16 text-sees-mint/30 absolute inset-0 m-auto" />
                {member.avatarUrl && (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-full h-full object-cover relative"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-bold text-white">{member.name}</p>
                <p className="text-xs text-sees-mint/60 uppercase tracking-widest mt-1">
                  {member.role}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>

        <Link to="/register">
          <Button variant="secondary" size="md">
            Apply to Contribute
          </Button>
        </Link>
      </div>
    </section>
  );
};
