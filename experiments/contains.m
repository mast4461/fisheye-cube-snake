function [ bool ] = contains( array, value )
%UNTITLED2 Summary of this function goes here
%   Detailed explanation goes here

bool = ~isempty(find(array == value, 1));
end

