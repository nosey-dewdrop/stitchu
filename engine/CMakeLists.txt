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
