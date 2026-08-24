#include <cmath>
#include <cstdio>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include "bodice.hpp"
#include "garment.hpp"
#include "recipe.hpp"
using namespace stitchu;
static const BodyMeasurementsSnapshot kEU38{88,70,94,37,40.5,58,35};
static const BodyMeasurementsSnapshot kPear{96,70,116,37,41,58,36};
static const BodyMeasurementsSnapshot kBigNeck{100,84,104,30,40,58,50};
static const char* cn(CmdType t){switch(t){case CmdType::Move:return "move";case CmdType::Line:return "line";case CmdType::Curve:return "curve";default:return "close";}}
static void dump(const char* tag,const std::vector<PathCommand>&a,const std::vector<PathCommand>&b){
  printf("   %s: n=%zu vs %zu\n",tag,a.size(),b.size());
  size_t n=std::min(a.size(),b.size());
  for(size_t i=0;i<n;i++){
    double d=std::max(std::fabs(a[i].to.x-b[i].to.x),std::fabs(a[i].to.y-b[i].to.y));
    double dc=0; if(a[i].type==CmdType::Curve&&b[i].type==CmdType::Curve)
      dc=std::max(std::max(std::fabs(a[i].cp1.x-b[i].cp1.x),std::fabs(a[i].cp1.y-b[i].cp1.y)),
                  std::max(std::fabs(a[i].cp2.x-b[i].cp2.x),std::fabs(a[i].cp2.y-b[i].cp2.y)));
    if(d>1e-6||dc>1e-6||a[i].type!=b[i].type)
      printf("     [%zu] %s/%s to d=%.4f cp d=%.4f | rec to(%.3f,%.3f) motor to(%.3f,%.3f) | rec cp1(%.3f,%.3f) cp2(%.3f,%.3f) motor cp1(%.3f,%.3f) cp2(%.3f,%.3f)\n",
        i,cn(a[i].type),cn(b[i].type),d,dc,a[i].to.x,a[i].to.y,b[i].to.x,b[i].to.y,
        a[i].cp1.x,a[i].cp1.y,a[i].cp2.x,a[i].cp2.y,b[i].cp1.x,b[i].cp1.y,b[i].cp2.x,b[i].cp2.y);
  }
}
int main(int argc,char**argv){
  std::ifstream in(argv[1]);std::ostringstream buf;buf<<in.rdbuf();
  auto loaded=recipe::parseRecipe(buf.str());
  if(!loaded.ok){printf("parse fail %s\n",loaded.error.c_str());return 1;}
  const auto& rcp=loaded.value; const GarmentSpec spec=recipe::kernelSpec(rcp);
  const double pin=belowWaist(TopLength::Tunic);
  for(auto [name,body]:std::vector<std::pair<const char*,const BodyMeasurementsSnapshot*>>{{"EU38",&kEU38},{"pear",&kPear},{"bigNeck",&kBigNeck}}){
    const DraftedPattern motor=GarmentDrafter::draft(spec,*body);
    const auto rec=recipe::draftRecipe(rcp,*body,{{"extendMM",pin}});
    if(!rec.ok){printf("%s draft fail %s\n",name,rec.error.c_str());continue;}
    for(size_t i=0;i<std::min(rec.value.pieces.size(),motor.pieces.size());++i){
      const auto&a=rec.value.pieces[i];const auto&b=motor.pieces[i];
      printf("== %s piece '%s' vs '%s' (SA %.2f vs %.2f, cut '%s' vs '%s')\n",name,a.name.c_str(),b.name.c_str(),a.seamAllowance,b.seamAllowance,a.cutInstruction.c_str(),b.cutInstruction.c_str());
      dump("outline",a.commands,b.commands);
      dump("markings",a.markings,b.markings);
      dump("notches",a.notches,b.notches);
      dump("cutLine",a.cutLine,b.cutLine);
    }
  }
  return 0;
}
