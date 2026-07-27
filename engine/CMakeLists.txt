cmake_minimum_required(VERSION 3.20)
project(stitchu_engine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_library(engine
    src/geometry.cpp
    src/bodice.cpp
    src/skirt.cpp
    src/ruffle.cpp
    src/keyhole.cpp
    src/placket.cpp
    src/tie.cpp
    src/collar.cpp
    src/gather.cpp
    src/openback.cpp
    src/laceupback.cpp
    src/wrapfront.cpp
    src/slit.cpp
    src/strap.cpp
    src/peplum.cpp
    src/hemflounce.cpp
    src/cupseam.cpp
    src/yoke.cpp
    src/boxpleat.cpp
    src/pocket.cpp
    src/neckext.cpp
    src/cuff.cpp
    src/hem.cpp
    src/shoulder.cpp
    src/buttonrow.cpp
    src/exposedzip.cpp
    src/backdetail.cpp
    src/offshoulder.cpp
    src/sleeve.cpp
    src/garment.cpp
    src/wearability.cpp
    src/validator.cpp)
target_include_directories(engine PUBLIC src)
target_compile_options(engine PRIVATE -Wall -Wextra)

enable_testing()
add_executable(test_geometry tests/test_geometry.cpp)
target_link_libraries(test_geometry PRIVATE engine)
add_test(NAME geometry COMMAND test_geometry)

add_executable(engine_check tests/engine_check.cpp)
target_link_libraries(engine_check PRIVATE engine)
add_test(NAME engine_check COMMAND engine_check)

add_executable(golden_dump tests/golden_dump.cpp)
target_link_libraries(golden_dump PRIVATE engine)
# The real golden test: fresh dump vs the REPO PIN (engine/golden-reference.csv).
# Regen-vs-regen is not a golden check. Pin moves only via scripts/repin-golden.sh
# with a declared label in engine/GOLDEN-PIN.md.
add_test(NAME golden_check COMMAND ${CMAKE_CURRENT_SOURCE_DIR}/tests/golden_check.sh
    $<TARGET_FILE:golden_dump>
    ${CMAKE_CURRENT_SOURCE_DIR}/golden-reference.csv
    ${CMAKE_CURRENT_SOURCE_DIR}/GOLDEN-PIN.md)

# style_check: GOLDEN-PIN'in görsel kardeşi. Damla "kalemim" dediği her flat
# render'ı REPO PİNİNE (engine/STYLE-PIN/<style>.svg) diff'ler. node script.
add_test(NAME style_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/style_check.mjs)

# bridge_guard: köprü sessiz-düşürme yasağı (2026-07-23). princess/straps spec
# eşleşen styleKey yokken plain dart/scoop REFERANS tank'e degrade OLMAMALI (ikame).
add_test(NAME bridge_guard COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/bridge_guard.mjs)

# 27 Tem kopuk kablo mandalları (json-el adli raporu): dört sessiz kopukluk.
# api_wire_check: skirtLengthMM API yolunda motora ULAŞIR (backend normalize
# spec taşır, web=backend aynı mm, 353!=1100 kalıp, 0/atlanmış default aynı).
add_test(NAME api_wire_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/api_wire_check.mjs)
# collar_bridge_check: şema enum'unun HER collar tipi ya köprüde çizilir ya
# missing.js kartına düşer — peterPan camelCase sessiz-düşme sınıfı ölü.
add_test(NAME collar_bridge_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/collar_bridge_check.mjs)
# skirtlen_refresh_check: foto mm'i gövdeyi İZLER (foto-anı donması yasak),
# elle mini/midi/maxi seçimi mm'i düşük tutar, create.js kablosu takılı.
add_test(NAME skirtlen_refresh_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/skirtlen_refresh_check.mjs)
# compile_dialect_check: compile() web lehçesini (waistline/fabric/skirtLengthMM)
# meşru tanır — flat byte-identical, mm motora ulaşır, geçersiz değer dürüst red.
add_test(NAME compile_dialect_check COMMAND node ${CMAKE_CURRENT_SOURCE_DIR}/tests/compile_dialect_check.mjs)

add_executable(ruffle_check tests/ruffle_check.cpp)
target_link_libraries(ruffle_check PRIVATE engine)
add_test(NAME ruffle_check COMMAND ruffle_check)

add_executable(tiered_ruffle_check tests/tiered_ruffle_check.cpp)
target_link_libraries(tiered_ruffle_check PRIVATE engine)
add_test(NAME tiered_ruffle_check COMMAND tiered_ruffle_check)

add_executable(sweetheart_check tests/sweetheart_check.cpp)
target_link_libraries(sweetheart_check PRIVATE engine)
add_test(NAME sweetheart_check COMMAND sweetheart_check)

add_executable(keyhole_check tests/keyhole_check.cpp)
target_link_libraries(keyhole_check PRIVATE engine)
add_test(NAME keyhole_check COMMAND keyhole_check)

add_executable(placket_check tests/placket_check.cpp)
target_link_libraries(placket_check PRIVATE engine)
add_test(NAME placket_check COMMAND placket_check)

add_executable(tie_check tests/tie_check.cpp)
target_link_libraries(tie_check PRIVATE engine)
add_test(NAME tie_check COMMAND tie_check)

add_executable(collar_check tests/collar_check.cpp)
target_link_libraries(collar_check PRIVATE engine)
add_test(NAME collar_check COMMAND collar_check)

add_executable(gather_check tests/gather_check.cpp)
target_link_libraries(gather_check PRIVATE engine)
add_test(NAME gather_check COMMAND gather_check)

add_executable(backopen_check tests/backopen_check.cpp)
target_link_libraries(backopen_check PRIVATE engine)
add_test(NAME backopen_check COMMAND backopen_check)

add_executable(laceupback_check tests/laceupback_check.cpp)
target_link_libraries(laceupback_check PRIVATE engine)
add_test(NAME laceupback_check COMMAND laceupback_check)

add_executable(wrapfront_check tests/wrapfront_check.cpp)
target_link_libraries(wrapfront_check PRIVATE engine)
add_test(NAME wrapfront_check COMMAND wrapfront_check)

add_executable(slit_check tests/slit_check.cpp)
target_link_libraries(slit_check PRIVATE engine)
add_test(NAME slit_check COMMAND slit_check)

add_executable(skirtlen_check tests/skirtlen_check.cpp)
target_link_libraries(skirtlen_check PRIVATE engine)
add_test(NAME skirtlen_check COMMAND skirtlen_check)

add_executable(strap_check tests/strap_check.cpp)
target_link_libraries(strap_check PRIVATE engine)
add_test(NAME strap_check COMMAND strap_check)

add_executable(peplum_check tests/peplum_check.cpp)
target_link_libraries(peplum_check PRIVATE engine)
add_test(NAME peplum_check COMMAND peplum_check)

add_executable(hemflounce_check tests/hemflounce_check.cpp)
target_link_libraries(hemflounce_check PRIVATE engine)
add_test(NAME hemflounce_check COMMAND hemflounce_check)

add_executable(gore_check tests/gore_check.cpp)
target_link_libraries(gore_check PRIVATE engine)
add_test(NAME gore_check COMMAND gore_check)

add_executable(pocket_check tests/pocket_check.cpp)
target_link_libraries(pocket_check PRIVATE engine)
add_test(NAME pocket_check COMMAND pocket_check)

add_executable(cup_check tests/cup_check.cpp)
target_link_libraries(cup_check PRIVATE engine)
add_test(NAME cup_check COMMAND cup_check)
add_executable(yoke_check tests/yoke_check.cpp)
target_link_libraries(yoke_check PRIVATE engine)
add_test(NAME yoke_check COMMAND yoke_check)
add_executable(boxpleat_check tests/boxpleat_check.cpp)
target_link_libraries(boxpleat_check PRIVATE engine)
add_test(NAME boxpleat_check COMMAND boxpleat_check)
add_executable(cuff_check tests/cuff_check.cpp)
target_link_libraries(cuff_check PRIVATE engine)
add_test(NAME cuff_check COMMAND cuff_check)

add_executable(neckline_ext_check tests/neckline_ext_check.cpp)
target_link_libraries(neckline_ext_check PRIVATE engine)
add_test(NAME neckline_ext_check COMMAND neckline_ext_check)

add_executable(hem_check tests/hem_check.cpp)
target_link_libraries(hem_check PRIVATE engine)
add_test(NAME hem_check COMMAND hem_check)

add_executable(halter_check tests/halter_check.cpp)
target_link_libraries(halter_check PRIVATE engine)
add_test(NAME halter_check COMMAND halter_check)

add_executable(bias_check tests/bias_check.cpp)
target_link_libraries(bias_check PRIVATE engine)
add_test(NAME bias_check COMMAND bias_check)

add_executable(cutline_check tests/cutline_check.cpp)
target_link_libraries(cutline_check PRIVATE engine)
add_test(NAME cutline_check COMMAND cutline_check)

add_executable(sleeve_check tests/sleeve_check.cpp)
target_link_libraries(sleeve_check PRIVATE engine)
add_test(NAME sleeve_check COMMAND sleeve_check)

add_executable(cap_sleeve_check tests/cap_sleeve_check.cpp)
target_link_libraries(cap_sleeve_check PRIVATE engine)
add_test(NAME cap_sleeve_check COMMAND cap_sleeve_check)

add_executable(placket_asym_check tests/placket_asym_check.cpp)
target_link_libraries(placket_asym_check PRIVATE engine)
add_test(NAME placket_asym_check COMMAND placket_asym_check)

add_executable(fit_proof tests/fit_proof.cpp)
target_link_libraries(fit_proof PRIVATE engine)
add_test(NAME fit_proof COMMAND fit_proof)

add_executable(sloper_check tests/sloper_check.cpp)
target_link_libraries(sloper_check PRIVATE engine)
add_test(NAME sloper_check COMMAND sloper_check)

add_executable(fba_check tests/fba_check.cpp)
target_link_libraries(fba_check PRIVATE engine)
add_test(NAME fba_check COMMAND fba_check)

add_executable(grade_check tests/grade_check.cpp)
target_link_libraries(grade_check PRIVATE engine)
add_test(NAME grade_check COMMAND grade_check)

add_executable(wearability_check tests/wearability_check.cpp)
target_link_libraries(wearability_check PRIVATE engine)
add_test(NAME wearability_check COMMAND wearability_check)

add_executable(wearability-bench tools/wearability-bench.cpp)
target_link_libraries(wearability-bench PRIVATE engine)

add_executable(shoulder_check tests/shoulder_check.cpp)
target_link_libraries(shoulder_check PRIVATE engine)
add_test(NAME shoulder_check COMMAND shoulder_check)

add_executable(buttonrow_check tests/buttonrow_check.cpp)
target_link_libraries(buttonrow_check PRIVATE engine)
add_test(NAME buttonrow_check COMMAND buttonrow_check)

add_executable(exposedzip_check tests/exposedzip_check.cpp)
target_link_libraries(exposedzip_check PRIVATE engine)
add_test(NAME exposedzip_check COMMAND exposedzip_check)

add_executable(backdetail_check tests/backdetail_check.cpp)
target_link_libraries(backdetail_check PRIVATE engine)
add_test(NAME backdetail_check COMMAND backdetail_check)

add_executable(fronttie_check tests/fronttie_check.cpp)
target_link_libraries(fronttie_check PRIVATE engine)
add_test(NAME fronttie_check COMMAND fronttie_check)

add_executable(offshoulder_check tests/offshoulder_check.cpp)
target_link_libraries(offshoulder_check PRIVATE engine)
add_test(NAME offshoulder_check COMMAND offshoulder_check)

add_executable(sideseam_adversarial_check tests/sideseam_adversarial_check.cpp)
target_link_libraries(sideseam_adversarial_check PRIVATE engine)
add_test(NAME sideseam_adversarial_check COMMAND sideseam_adversarial_check)

add_executable(notch_alignment_check tests/notch_alignment_check.cpp)
target_link_libraries(notch_alignment_check PRIVATE engine)
add_test(NAME notch_alignment_check COMMAND notch_alignment_check)

add_executable(closed_garment_check tests/closed_garment_check.cpp)
target_link_libraries(closed_garment_check PRIVATE engine)
add_test(NAME closed_garment_check COMMAND closed_garment_check)

add_executable(sewable_census tests/sewable_census.cpp)
target_link_libraries(sewable_census PRIVATE engine)
add_test(NAME sewable_census COMMAND sewable_census)

add_executable(roundtrip_check tests/roundtrip_check.cpp)
target_link_libraries(roundtrip_check PRIVATE engine)
add_test(NAME roundtrip_check COMMAND roundtrip_check)

add_executable(guide_check tests/guide_check.cpp)
target_link_libraries(guide_check PRIVATE engine)
add_test(NAME guide_check COMMAND guide_check)

# K2 composition ratchet (2026-07-19): the declared component x host and
# component x component conflict matrix (contract/composition.json via
# composition.gen.hpp) is re-derived by actually drafting every combination.
# A silent no-op not declared "ignored", or any declared-vs-observed class
# drift, fails the suite.
add_executable(compose_check tests/compose_check.cpp)
target_link_libraries(compose_check PRIVATE engine)
add_test(NAME compose_check COMMAND compose_check)

# K1 contract ratchet (2026-07-19): schema + term registry + generated
# consumers + flat recipes + runtime vision gate all validated in one node
# script. Any drift between contract/ and its consumers fails the suite.
find_program(NODE_EXECUTABLE node REQUIRED)
add_test(NAME contract_check COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/validate-contract.mjs)

# K2 flat render lint (2026-07-19): every flat style record in styles.json is
# rendered headlessly and checked for self-intersection, inconsistent winding
# (reversed normals), zero-area loops and sampleX y-monotonicity.
add_test(NAME flat_render_lint COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/render-lint.mjs)

# K3 preview truth (2026-07-19): one semantic JSON per flat style projected
# twice (display flat + drafted pattern); structural equality is hard (every
# drawn element needs a pattern counterpart, declared gaps allowlisted with
# contract refs), landmark deviation is soft 8% with pinned stylisation
# envelopes (contract/preview-truth.json) — drift beyond a pin fails.
add_test(NAME preview_truth_check COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/preview-truth.mjs)

# FIGURE_BASE mandalı (2026-07-22): her flat stilin gövde outline'ından bel
# oyuğu (waist/bust) ölçülür — figürel top [0.72,0.84] bandında, boxy >0.93
# kutu (iki yönlü: figürelleşirse de FAIL), dress/pinli taban değere ±0.02
# drift-lock (contract/figure-bands.json mandal). Bir daha kimse fark etmeden
# boru üretemez.
add_test(NAME figure_check COMMAND ${NODE_EXECUTABLE} ${CMAKE_CURRENT_SOURCE_DIR}/tools/figure-lint.mjs)
