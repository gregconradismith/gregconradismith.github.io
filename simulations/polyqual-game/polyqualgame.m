% Qualitative analysis quiz for pairs of nearby random polynomials.
%
% The game asks whether two polynomial graphs are qualitatively similar.
% After the guess, it reveals the sign patterns of f, f', and f'' as x
% moves from left to right. Consecutive intervals with the same signs are
% collapsed before comparing the two curves.

clear
close all
clc

rng('shuffle', 'twister');
set(0, 'DefaultTextFontName', 'Courier');
set(0, 'DefaultAxesFontSize', 20);

% Game settings.
numRounds = 31;
firstFigureNumber = 10;
careAboutSignF = false;
saveFigures = false;
figureDirectory = fullfile(fileparts(mfilename('fullpath')), 'figures');

% Polynomial-generation settings.
sigma = 5;
wiggle = sigma / 2;
x = -1:0.01:1;
verticalOffset = 10;

% Layout settings.
left = 0.05;
bottom = 0.30;
width = 1 - 2 * left;
height = 0.95 - bottom;
answerBottom = 0.05;
answerHeight = 0.05;
answerMargin = 0.02;
redScale = 0.90;

if saveFigures && ~exist(figureDirectory, 'dir')
    mkdir(figureDirectory);
end

for roundNumber = 1:numRounds
    figureNumber = firstFigureNumber + roundNumber - 1;

    degree = randi([2 4]); % Polynomial degree 2, 3, or 4.
    blueCoefficients = sigma * randn(degree + 1, 1);
    redCoefficients = blueCoefficients + wiggle * randn(degree + 1, 1);

    blueY = verticalOffset + polyval(blueCoefficients, x);
    redY = verticalOffset + polyval(redCoefficients, x);

    blueDY = polyval(polyder(blueCoefficients), x);
    redDY = polyval(polyder(redCoefficients), x);

    blueDDY = polyval(polyder(polyder(blueCoefficients)), x);
    redDDY = polyval(polyder(polyder(redCoefficients)), x);

    blueSigns = struct( ...
        'f', sign(blueY), ...
        'df', sign(blueDY), ...
        'ddf', sign(blueDDY));
    redSigns = struct( ...
        'f', sign(redY), ...
        'df', sign(redDY), ...
        'ddf', sign(redDDY));

    figure(1)
    clf

    mainAxes = subplot('Position', [left bottom width height]);
    plot(x, blueY, 'LineWidth', 2, 'Color', 'b');
    hold on
    plot(x, redY, 'LineWidth', 2, 'Color', 'r');
    if careAboutSignF
        line([-1 1], [0 0], 'Color', 'k');
    end
    axis off

    clc
    disp(' ')
    disp('Are they qualitatively similar?')
    disp(' ')
    pause

    plotSignRow(x, blueSigns.ddf, redSigns.ddf, redScale, ...
        [left answerBottom width answerHeight], 'f''''');
    plotSignRow(x, blueSigns.df, redSigns.df, redScale, ...
        [left answerBottom + answerHeight + answerMargin width answerHeight], 'f''');

    if careAboutSignF
        plotSignRow(x, blueSigns.f, redSigns.f, redScale, ...
            [left answerBottom + 2 * (answerHeight + answerMargin) width answerHeight], 'f');
    end

    blueState = collapseSignStates(blueSigns, careAboutSignF);
    redState = collapseSignStates(redSigns, careAboutSignF);

    bluePattern = signsToChars(blueState);
    redPattern = signsToChars(redState);

    if isequal(bluePattern, redPattern)
        resultText = 'qualitatively similar';
    else
        resultText = 'qualitatively different';
    end

    disp(resultText)
    title(mainAxes, resultText)

    patternBottom = answerBottom + ...
        (2 + double(careAboutSignF)) * (answerHeight + answerMargin);

    annotation('textbox', [0.05 patternBottom 0.40 0.08], ...
        'String', bluePattern, ...
        'Color', 'b', ...
        'FontSize', 36, ...
        'FontName', 'Courier', ...
        'EdgeColor', 'none', ...
        'Interpreter', 'none');
    annotation('textbox', [0.52 patternBottom 0.40 0.08], ...
        'String', redPattern, ...
        'Color', 'r', ...
        'FontSize', 36, ...
        'FontName', 'Courier', ...
        'EdgeColor', 'none', ...
        'Interpreter', 'none');

    if saveFigures
        outputName = fullfile(figureDirectory, sprintf('polyqual%d.pdf', figureNumber));
        print(outputName, '-dpdf')
    end

    disp(' ')
    disp(' ')
    disp('Another?')
    pause
end

close all

function plotSignRow(x, blueSign, redSign, redScale, position, rowLabel)
    subplot('Position', position)
    line([-1 1], [0 0], 'Color', 'k');
    hold on
    stairs(x, blueSign, 'LineWidth', 2, 'Color', 'b');
    stairs(x, redScale * redSign, 'LineWidth', 2, 'Color', 'r');
    text(-1.08, 0, rowLabel, ...
        'HorizontalAlignment', 'right', ...
        'VerticalAlignment', 'middle', ...
        'FontSize', 14);
    axis([-Inf Inf -1.1 1.1])
    axis off
end

function states = collapseSignStates(signs, includeF)
    if includeF
        rawStates = [signs.f; signs.df; signs.ddf];
    else
        rawStates = [signs.df; signs.ddf];
    end

    states = rawStates(:, 1);
    for k = 2:size(rawStates, 2)
        if any(states(:, end) ~= rawStates(:, k))
            states(:, end + 1) = rawStates(:, k); %#ok<AGROW>
        end
    end
end

function pattern = signsToChars(states)
    pattern = '';

    for k = 1:size(states, 2)
        columnChars = repmat(' ', 1, size(states, 1));
        for row = 1:size(states, 1)
            if states(row, k) < 0
                columnChars(row) = '-';
            elseif states(row, k) > 0
                columnChars(row) = '+';
            else
                columnChars(row) = '0';
            end
        end

        if k == 1
            pattern = columnChars;
        else
            pattern = [pattern '  ' columnChars]; %#ok<AGROW>
        end
    end
end
