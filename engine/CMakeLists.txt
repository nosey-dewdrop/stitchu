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
    src/slit.cpp
    src/strap.cpp
    src/peplum.cpp
    src/pocket.cpp
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

add_executable(slit_check tests/slit_check.cpp)
target_link_libraries(slit_check PRIVATE engine)
add_test(NAME slit_check COMMAND slit_check)

add_executable(strap_check tests/strap_check.cpp)
target_link_libraries(strap_check PRIVATE engine)
add_test(NAME strap_check COMMAND strap_check)

add_executable(peplum_check tests/peplum_check.cpp)
target_link_libraries(peplum_check PRIVATE engine)
add_test(NAME peplum_check COMMAND peplum_check)

add_executable(pocket_check tests/pocket_check.cpp)
target_link_libraries(pocket_check PRIVATE engine)
add_test(NAME pocket_check COMMAND pocket_check)

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
