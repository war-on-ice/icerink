var RINK_MAP = function RinkMap(config){

    // all distances are in FT
    var RINK_CONFIG =
    {   
        RINK_LENGTH: 200,
        RINK_WIDTH: 85,
        BLUE_LINE_WIDTH: 1,
        BOARDS_RADIUS: 28,
        RED_TO_BOARDS: 11,
        RED_TO_FACEOFF: 20,
        FACEOFF_RADIUS: 15,
        FACEOFF_DOT_RADIUS: 1,
        ZONE_LINE_WIDTH: (2/12),
        CREASE_RADIUS: 6,
        ZONE_LENGTH: 75,
        ZONE_TO_NEUTRAL_DOT: 5,
        CENTER_TO_NEUTRAL_DOT: 22,
        REF_CREASE_RADIUS: 10,
        CREASE_HEIGHT: 4,
        FACEOFF_HOR_LENGTH: 3,
        FACEOFF_VER_LENGTH: 4,
        FACEOFF_HOR_DIST_CEN: 2,
        FACEOFF_VER_DIST_CEN: (9/12),
        FACEOFF_OUT_MARK_LENGTH: 2,
        FACEOFF_OUT_MARK_DIST_BW: 5 + (7/12),
        TRAPEZOID_TOP: 22,
        TRAPEZOID_BOTTOM: 28
    };

    var RINK_COLOR = 
    {
        BLUE_LINE: "blue",
        RINK_FILL: "white",
        GOAL_FILL: "lightblue"
    }

    var DANGER_ZONES = [{x1: -9.11, y1: 89.1},
    {x1: -22.1, y1: 68.9}, {x1: -22.1, y1: 53.9},
    {x1: -9.11, y1: 53.9}, {x1: -9.11, y1: 43.9},
    {x1: 9.11, y1: 43.9}, {x1: 9.11, y1: 53.9},
    {x1: 22.1, y1: 53.9}, {x1: 22.1, y1: 68.9},
    {x1: 9.11, y1: 89.1}, {x1: -9.11, y1: 89.1},
    {x1: -9.11, y1: 68.9}, {x1: 9.11, y1: 68.9},
    {x1: 9.11, y1: 89.1}, {x1: -9.11, y1: 89.1}];

    var p =
    {
        chartsize: {width: 500, height: 500},
        margins:  {top: 30, bottom: 5, left: 10, right: 10},
        showDanger: false,
        horizontal: true,
        fullRink: true,
        watermark: ""
    }

    if (config !== "undefined"){
        for (var property in config){
            p[property] = config[property];
        }
    }

    // Get rink scale, scale all rink config distances
    var rinkScale = p.desiredWidth / RINK_CONFIG.RINK_WIDTH;
    for (var param in RINK_CONFIG){
        RINK_CONFIG[param] = rinkScale * RINK_CONFIG[param];
    }

    // CREATE CHART
    function chart() {
        
        function rinkLine(x, group, type){
            var lineWidth = RINK_CONFIG.BLUE_LINE_WIDTH;
            if (type === "center-line"){
                var lineWidth = RINK_CONFIG.BLUE_LINE_WIDTH/2;
            }
            group
                .append("rect")
                .attr("x", x - lineWidth)
                .attr("y", 0)
                .attr("width", lineWidth)
                .attr("height", RINK_CONFIG.RINK_WIDTH)
                .attr("class", type);
        }

        function rinkOutLine(group){

            group.append("path")
                .attr("d", rounded_rect(0,0, RINK_CONFIG.RINK_LENGTH *0.5, RINK_CONFIG.RINK_WIDTH, RINK_CONFIG.BOARDS_RADIUS, true, false, true, false))
                .attr("class", "rink-face")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH) 
            
        }

        // From stackOverflow http://stackoverflow.com/questions/12115691/svg-d3-js-rounded-corner-on-one-corner-of-a-rectangle
        // r -> radius, tl/tr/bl/br - top left/bottom right TRUE/FALSE for posessing rounded corner
        function rounded_rect(x, y, w, h, r, tl, tr, bl, br) {
            var retval;
            retval  = "M" + (x + r) + "," + y;
            retval += "h" + (w - 2*r);
            if (tr) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + r; }
            else { retval += "h" + r; retval += "v" + r; }
            retval += "v" + (h - 2*r);
            if (br) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + r; }
            else { retval += "v" + r; retval += "h" + -r; }
            retval += "h" + (2*r - w);
            if (bl) { retval += "a" + r + "," + r + " 0 0 1 " + -r + "," + -r; }
            else { retval += "h" + -r; retval += "v" + -r; }
            retval += "v" + (2*r - h);
            if (tl) { retval += "a" + r + "," + r + " 0 0 1 " + r + "," + -r; }
            else { retval += "v" + -r; retval += "h" + r; }
            retval += "z";
            return retval;
        }

        // Create goal crease with center at point (x,y) and width d
        function goalCrease(xPos, group){

            var creaseData = [  {"x": xPos, "y": (RINK_CONFIG.RINK_WIDTH/2 ) - RINK_CONFIG.CREASE_HEIGHT , "type": "M"},
                                {"x": xPos + RINK_CONFIG.CREASE_HEIGHT, "y":(RINK_CONFIG.RINK_WIDTH/2 ) - RINK_CONFIG.CREASE_HEIGHT, "type": "L"},
                                {"x": xPos + RINK_CONFIG.CREASE_HEIGHT, "y": (RINK_CONFIG.RINK_WIDTH/2 ) + RINK_CONFIG.CREASE_HEIGHT, "type": "A", "radius": RINK_CONFIG.CREASE_RADIUS},
                                {"x": xPos, "y": (RINK_CONFIG.RINK_WIDTH/2 ) + RINK_CONFIG.CREASE_HEIGHT, "type": "L"}];

            var creaseFunction = function(input){
                var dStr = "";
                for (var i=0; i < input.length; i++){
                    if (input[i]["type"] === "M" || input[i]["type"] === "L"){
                        dStr += input[i]["type"] + input[i]["x"] + "," + input[i]["y"];
                    }
                    else if (input[i]["type"] === "A"){
                        dStr += input[i]["type"] + input[i]["radius"] + "," + input[i]["radius"] + ",0,0,1," + input[i]["x"] + "," + input[i]["y"];
                    }
                }
                return dStr;
            }

            group
                .append("path")
                .attr("d", creaseFunction(creaseData))
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("class", "goal-crease");   
        }

        // Create red-line at xPos to scale
        function redLine(x, group){
            var yDistance = RINK_CONFIG.BOARDS_RADIUS - Math.sqrt((2 * RINK_CONFIG.RED_TO_BOARDS * RINK_CONFIG.BOARDS_RADIUS) - (RINK_CONFIG.RED_TO_BOARDS * RINK_CONFIG.RED_TO_BOARDS));
            group
                .append("rect") 
                .attr("x", x)
                .attr("y", yDistance)
                .attr("width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("height", RINK_CONFIG.RINK_WIDTH - 2 * yDistance)
                .attr("class", "red-line");
        }

        function faceOffDot(x,y, group){
            group
                .append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", RINK_CONFIG.FACEOFF_DOT_RADIUS)
                .attr("class", "red-line");
        }

        // Create face-off circule with radius r at point (x,y)
        function faceOffCircle(x, y, group){
            var faceOff = group.append("g")
              .attr("class", "faceoff");

            
            // outer face-off circle
            faceOff.append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", RINK_CONFIG.FACEOFF_RADIUS)
                .style("fill", RINK_COLOR.RINK_FILL)
                .attr("class", "red-faceoff")
                .style("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH);

            // face-off dot
            faceOff
                .append("circle")
                .attr("cx", x)
                .attr("cy", y)
                .attr("r", RINK_CONFIG.FACEOFF_DOT_RADIUS)
                .attr("class", "red-line");

            // Function/data to create four face-off markers
            var faceOffLineFunction = d3.svg.line()
                .x(function(d) {return RINK_CONFIG.FACEOFF_HOR_DIST_CEN + d.x; })
                .y(function(d) {return RINK_CONFIG.FACEOFF_VER_DIST_CEN + d.y; })
                .interpolate("linear");
            var faceOffLineData = [ {"x": RINK_CONFIG.FACEOFF_VER_LENGTH, "y": 0} ,{"x": 0, "y": 0},{"x": 0, "y": RINK_CONFIG.FACEOFF_HOR_LENGTH}];

            // Create four markers, each translated appropriately off-of (x,y)
            faceOff
                .append("path")
                .attr("d", faceOffLineFunction(faceOffLineData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none")
                .attr("transform", "translate(" + x + " , " + y + ")scale(-1, -1)");
            faceOff
                .append("path")
                .attr("d", faceOffLineFunction(faceOffLineData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none")
                .attr("transform", "translate(" + x + " , " + y + ")scale(1,-1)");
            faceOff
                .append("path")
                .attr("d", faceOffLineFunction(faceOffLineData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none")
                .attr("transform", "translate(" + x + " , " + y + ")");
            faceOff
                .append("path")
                .attr("d", faceOffLineFunction(faceOffLineData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none")
                .attr("transform", "translate(" + x + " , " + y + ")scale(-1, 1)");

            // Create two hash on outside of circle (each side)
            // Function/data to create outside line markers
            var outsideLineFunction = d3.svg.line()
                .x(function(d) {return  d.x; })
                .y(function(d) {return  d.y; })
                .interpolate("linear");
            var xStartOutsideLine = 0.5 * RINK_CONFIG.FACEOFF_OUT_MARK_DIST_BW * Math.tan(Math.acos(0.5 * RINK_CONFIG.FACEOFF_OUT_MARK_DIST_BW/RINK_CONFIG.FACEOFF_RADIUS));
            var outsideLineData = [ {"x": 0, "y": xStartOutsideLine} ,{"x": 0, "y": xStartOutsideLine + RINK_CONFIG.FACEOFF_OUT_MARK_LENGTH}];
            faceOff
                .append("path")
                .attr("d", outsideLineFunction(outsideLineData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none")
                .attr("transform", "translate(" + (x - 0.5 * RINK_CONFIG.FACEOFF_OUT_MARK_DIST_BW) + " , " + y + ")");
            faceOff
                .append("path")
                .attr("d", outsideLineFunction(outsideLineData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none")
                .attr("transform", "translate(" + (x + 0.5 * RINK_CONFIG.FACEOFF_OUT_MARK_DIST_BW) + " , " + y + ")");
             faceOff
                .append("path")
                .attr("d", outsideLineFunction(outsideLineData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none")
                .attr("transform", "translate(" + (x + 0.5 * RINK_CONFIG.FACEOFF_OUT_MARK_DIST_BW) + " , " + y + "), scale(1,-1)");
            faceOff
                .append("path")
                .attr("d", outsideLineFunction(outsideLineData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none")
                .attr("transform", "translate(" + (x - 0.5 * RINK_CONFIG.FACEOFF_OUT_MARK_DIST_BW) + " , " + y + "), scale(1,-1)");

        }

        function trapezoid(xPos, group){

            var trapezoidFunction = d3.svg.line()
                .x(function(d) {return RINK_CONFIG.RED_TO_BOARDS + d.x; })
                .y(function(d) {return (0.5 * (RINK_CONFIG.RINK_WIDTH - RINK_CONFIG.CENTER_TO_NEUTRAL_DOT)) + d.y; })
                .interpolate("linear");

            var trapezoidData = [ {"x": -1 * RINK_CONFIG.RED_TO_BOARDS, "y": -0.5 * (RINK_CONFIG.TRAPEZOID_BOTTOM - RINK_CONFIG.TRAPEZOID_TOP)} ,{"x":0 , "y": 0}];

            group
                .append("path")
                .attr("d", trapezoidFunction(trapezoidData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none")
                .attr("transform", "translate(" + xPos + " ,0)");
            group
                .append("path")
                .attr("d", trapezoidFunction(trapezoidData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none")
                .attr("transform", "scale(1,-1),translate(" + xPos + "," + (-1 * RINK_CONFIG.RINK_WIDTH) + ")");
        }

        function neutralCircle(x, y, group){

            var circleData = [  {"x": x, "y": y - RINK_CONFIG.FACEOFF_RADIUS, "type": "M"},
                            {"x": x, "y": y + RINK_CONFIG.FACEOFF_RADIUS, "type": "A", "radius": RINK_CONFIG.FACEOFF_RADIUS, "dir": 0}];

            group
                .append("path")
                .attr("d", dStringCreator(circleData))
                .attr("class", "neutral-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none");    
        }

        var dStringCreator = function(input){
            var dStr = "";
            for (var i=0; i < input.length; i++){
                if (input[i]["type"] === "M" || input[i]["type"] === "L"){
                    dStr += input[i]["type"] + input[i]["x"] + " " + input[i]["y"];
                }
                else if (input[i]["type"] === "A"){
                    dStr += input[i]["type"] + input[i]["radius"] + "," + input[i]["radius"] + ",0,0," + input[i]["dir"] + "," + input[i]["x"] + "," + input[i]["y"];
                }
                else{
                    "neither";
                }
            }
            return dStr;
        }

        function refereeCrease(xPos, group){
            var creaseData = [  {"x": xPos - RINK_CONFIG.REF_CREASE_RADIUS, "y": RINK_CONFIG.RINK_WIDTH, "type": "M"},
                                {"x": xPos, "y": RINK_CONFIG.RINK_WIDTH - RINK_CONFIG.REF_CREASE_RADIUS, "type": "A", "radius": RINK_CONFIG.REF_CREASE_RADIUS, "dir": 1}];
            
            group
                .append("path")
                .attr("d", dStringCreator(creaseData))
                .attr("class", "red-faceoff")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .attr("fill", "none");
        }

        function dangerZones(zoneCoords, group){
            var dangerZoneGroup = group.append("g").attr("class","danger-zone");
            var dangerData = [];

            dangerData[0] = {"type": "M", "x": (0.5 * RINK_CONFIG.RINK_LENGTH - zoneCoords[0]["y1"] * rinkScale), "y": (0.5 * RINK_CONFIG.RINK_WIDTH +zoneCoords[0]["x1"] * rinkScale)};

            var i = 1;
            for (coord in zoneCoords){
                dangerData[i] = {};
                dangerData[i]["x"] = 0.5 * RINK_CONFIG.RINK_LENGTH - zoneCoords[coord]["y1"] * rinkScale;
                dangerData[i]["y"] = 0.5 * RINK_CONFIG.RINK_WIDTH + zoneCoords[coord]["x1"] * rinkScale;
                dangerData[i]["type"] = "L";
                i++;
            }

            dangerZoneGroup
                .append("path")
                .attr("d", dStringCreator(dangerData))
                .attr("class", "danger-line")
                .attr("stroke-width", RINK_CONFIG.ZONE_LINE_WIDTH)
                .style("stroke-dasharray", "10,10")
                .attr("fill", "none");
        }

        function waterMark(xPos, yPos, waterMarkText, group){
            group
                .append("text")
                .style("fill", "lightgray")
                .style("font-size", "18px")
                .style("text-anchor", "middle")
                .style("alignment-baseline", "middle")
                .attr("transform", "translate(" + xPos +"," + yPos + ") rotate(90)")
                .text(waterMarkText);
        }

        var zones = p.parent.append("g").attr("class", "zones");

        // RINK CONFIGURATON -- BOTH ZONES
        var zone1 = zones.append("g")
                      .attr("class", "zone1");
        var zone1Elements = zone1.append("g").attr("class", "rinkElements");
        generateRinkElements(zone1Elements);

        function generateRinkElements(zoneGroup){
            // RINK OUT LINE, CENTER LINE
            rinkOutLine(zoneGroup);
            rinkLine(0.5 * RINK_CONFIG.RINK_LENGTH, zoneGroup, "center-line");

            // NEUTRAL ZONE
            refereeCrease(0.5 * RINK_CONFIG.RINK_LENGTH, zoneGroup);
            neutralCircle(0.5 * RINK_CONFIG.RINK_LENGTH, 0.5 * RINK_CONFIG.RINK_WIDTH, zoneGroup);

            faceOffDot(RINK_CONFIG.ZONE_LENGTH + RINK_CONFIG.ZONE_TO_NEUTRAL_DOT, (RINK_CONFIG.RINK_WIDTH/2 - RINK_CONFIG.CENTER_TO_NEUTRAL_DOT), zoneGroup);
            faceOffDot(RINK_CONFIG.ZONE_LENGTH + RINK_CONFIG.ZONE_TO_NEUTRAL_DOT, (RINK_CONFIG.RINK_WIDTH/2 + RINK_CONFIG.CENTER_TO_NEUTRAL_DOT), zoneGroup);

            // O-ZONE
            rinkLine(RINK_CONFIG.ZONE_LENGTH, zoneGroup, "blue-line");
            faceOffCircle(RINK_CONFIG.RED_TO_BOARDS + RINK_CONFIG.RED_TO_FACEOFF, RINK_CONFIG.RINK_WIDTH/2 - RINK_CONFIG.CENTER_TO_NEUTRAL_DOT, zoneGroup);
            faceOffCircle(RINK_CONFIG.RED_TO_BOARDS + RINK_CONFIG.RED_TO_FACEOFF, RINK_CONFIG.RINK_WIDTH/2 + RINK_CONFIG.CENTER_TO_NEUTRAL_DOT, zoneGroup);

            //GOAL LINES
            redLine(RINK_CONFIG.RED_TO_BOARDS, zoneGroup);
            trapezoid(0, zoneGroup);
            goalCrease(RINK_CONFIG.RED_TO_BOARDS, zoneGroup);

            // Show danger if flagged
            if (p.showDanger){
              dangerZones(DANGER_ZONES, zoneGroup);  
            }
            
            waterMark(RINK_CONFIG.RED_TO_BOARDS /2, RINK_CONFIG.RINK_WIDTH/2, p.watermark, zoneGroup);

        }

        // FULL RINK. Generate second zone.
        if (p.fullRink){
            zoneName = "zone2";
            var zone2 = zones.append("g")
                .attr("class", zoneName);

            var zone2Elements = zone2.append("g").attr("class", "rinkElements");

            generateRinkElements(zone2Elements);
            // FULL RINK, HORIZONTAL. Rotate second zone.
            if (p.horizontal){
                p.parent.selectAll(".zone2")
                    .attr("transform", "scale(-1, 1)translate(" + (-1 * (RINK_CONFIG.RINK_LENGTH)) + ",0)");

            }
            // FULL RINK, VERTICAL. rotate/move both zones.
            else{
                p.parent.selectAll(".zone1")
                    .attr("transform", "rotate(-90)translate(" + (-1 * (RINK_CONFIG.RINK_LENGTH)) +",0)");
                p.parent.selectAll(".zone2")
                    .attr("transform", "scale(-1,1)rotate(90)");                  
            }
        }
        else{
            // HALF RINK, VERTICAL.
            if (!p.horizontal){
                p.parent.selectAll(".zone1")
                    .attr("transform", "rotate(-90)translate(" + (-1*(RINK_CONFIG.RINK_LENGTH/2)) +",0)");
           
            }
        }
        // move for margins
        p.parent.selectAll(".zones").attr("transform", "translate(" + p.margins.left + "," + p.margins.top + ")");

    }
    return chart;
};

