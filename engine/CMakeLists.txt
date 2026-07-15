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
    src/sleeve.cpp
    src/garment.cpp
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

add_executable(halter_check tests/halter_check.cpp)
target_link_libraries(halter_check PRIVATE engine)
add_test(NAME halter_check COMMAND halter_check)

add_executable(cutline_check tests/cutline_check.cpp)
target_link_libraries(cutline_check PRIVATE engine)
add_test(NAME cutline_check COMMAND cutline_check)

add_executable(sleeve_check tests/sleeve_check.cpp)
target_link_libraries(sleeve_check PRIVATE engine)
add_test(NAME sleeve_check COMMAND sleeve_check)

add_executable(fit_proof tests/fit_proof.cpp)
target_link_libraries(fit_proof PRIVATE engine)
add_test(NAME fit_proof COMMAND fit_proof)

add_executable(fba_check tests/fba_check.cpp)
target_link_libraries(fba_check PRIVATE engine)
add_test(NAME fba_check COMMAND fba_check)

add_executable(grade_check tests/grade_check.cpp)
target_link_libraries(grade_check PRIVATE engine)
add_test(NAME grade_check COMMAND grade_check)
