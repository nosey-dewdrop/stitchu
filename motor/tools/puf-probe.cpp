#include <cstdio>
#include "../src/bodice.hpp"
#include "../src/sleeve.hpp"
#include "../src/garment.hpp"
using namespace stitchu;
struct Body { double bu,wa,hi,sh,bl,al,ne; const char* name; };
static const Body BODIES[] = {
    {60,48,63,26,28,40,26,"min"},{160,128,168,52,55,75,55,"max"},{92,74,98,39,42,58,36,"mid"},
    {130,104,120,34,46,60,40,"bigbust-narrowsh"},{130,110,138,50,30,60,44,"petite-full"},
    {100,80,104,44,32,58,38,"mid-shortback"},{110,88,108,40,34,56,38,"full-petite"},
    {140,112,150,52,28,60,45,"xshortback"},{130,104,140,50,42,58,38,"widearm"},
    {88,70,94,37,40.5,58,35,"EU38"},
};
int main(){
  for (const Body& b : BODIES) {
    BodyMeasurementsSnapshot m{b.bu,b.wa,b.hi,b.sh,b.bl,b.al,b.ne};
    GarmentSpec s; s.garment=GarmentType::Dress; s.sleeveStyle=SleeveStyle::Straight; s.sleeveLength=SleeveLength::Short;
    const DraftedPattern d = GarmentDrafter::draft(s,m);
    const PatternPiece* p=nullptr;
    for (const auto& q:d.pieces) if (q.name.find("Sleeve")!=std::string::npos && q.name.find("Cuff")==std::string::npos) p=&q;
    if(!p){printf("%-18s NO SLEEVE\n",b.name);continue;}
    double chord = distance(p->commands[0].to,p->commands[2].to);
    double sag = p->commands[0].to.y;
    double arc = pathLength({PathCommand::move(p->commands[0].to),p->commands[1],p->commands[2]});
    BodiceBlock::BodiceOptions o; const BodiceDraft bod=BodiceBlock::draft(m,o);
    printf("%-18s chord=%8.2f sag=%8.2f sag/chord=%.4f arc=%8.2f armhole=%8.2f arc/ah=%.4f depth=%7.2f sag/depth=%.4f\n",
      b.name,chord,sag,sag/chord,arc,bod.armholeLength,arc/bod.armholeLength,bod.armholeDepth,sag/bod.armholeDepth);
  }
  return 0;
}
