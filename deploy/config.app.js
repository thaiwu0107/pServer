"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EnumTracerconfig_1 = require("./EnumTracerconfig");
// Web Environment
const isProdEnv = process.env.NODE_ENV === 'production';
const domainName = '/accounting'; // '/APServer'
const jwt = {
    active: true,
    privateKey: 'gama.net',
    expired: '200y' // Eg: 60, "2 days", "10h", "7d", "200y"
};
// tslint:disable-next-line:variable-name
const Tracerconfig = {
    filters: EnumTracerconfig_1.EnumTracerconfigSetting.NoFilter,
    open: true
};
// listen port
const httpPort = $httpPort$;
exports.default = {
    domainName,
    httpPort,
    jwt,
    Tracerconfig
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmFwcC5qcyIsInNvdXJjZVJvb3QiOiIvVXNlcnMvcGluZ2xld3UvRG9jdW1lbnRzL3ByYWN0aWNlL2FwaXNlcnZlcmFjY291bnRpbmcvc3JjLyIsInNvdXJjZXMiOlsiY29uZmlnL2NvbmZpZy5hcHAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx5REFBNkQ7QUFFN0Qsa0JBQWtCO0FBQ2xCLE1BQU0sU0FBUyxHQUFZLE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxLQUFLLFlBQVksQ0FBQztBQUVqRSxNQUFNLFVBQVUsR0FBVyxhQUFhLENBQUMsQ0FBQyxjQUFjO0FBT3hELE1BQU0sR0FBRyxHQUFlO0lBQ3BCLE1BQU0sRUFBRSxJQUFJO0lBQ1osVUFBVSxFQUFFLFVBQVU7SUFDdEIsT0FBTyxFQUFFLE1BQU0sQ0FBQyx3Q0FBd0M7Q0FDM0QsQ0FBQztBQUtGLHlDQUF5QztBQUN6QyxNQUFNLFlBQVksR0FBa0I7SUFDaEMsT0FBTyxFQUFFLDBDQUF1QixDQUFDLFFBQVE7SUFDekMsSUFBSSxFQUFFLElBQUk7Q0FDYixDQUFDO0FBQ0YsY0FBYztBQUNkLE1BQU0sUUFBUSxHQUFXLElBQUksQ0FBQztBQUU5QixrQkFBZTtJQUNYLFVBQVU7SUFDVixRQUFRO0lBQ1IsR0FBRztJQUNILFlBQVk7Q0FDZixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRW51bVRyYWNlcmNvbmZpZ1NldHRpbmcgfSBmcm9tICcuL0VudW1UcmFjZXJjb25maWcnO1xuXG4vLyBXZWIgRW52aXJvbm1lbnRcbmNvbnN0IGlzUHJvZEVudjogYm9vbGVhbiA9IHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbic7XG5cbmNvbnN0IGRvbWFpbk5hbWU6IHN0cmluZyA9ICcvYWNjb3VudGluZyc7IC8vICcvQVBTZXJ2ZXInXG5cbmludGVyZmFjZSBJSnd0Y29uZmlnIHtcbiAgICBhY3RpdmU6IGJvb2xlYW47XG4gICAgcHJpdmF0ZUtleTogc3RyaW5nO1xuICAgIGV4cGlyZWQ6IGFueTtcbn1cbmNvbnN0IGp3dDogSUp3dGNvbmZpZyA9IHtcbiAgICBhY3RpdmU6IHRydWUsXG4gICAgcHJpdmF0ZUtleTogJ2dhbWEubmV0JyxcbiAgICBleHBpcmVkOiAnMjAweScgLy8gRWc6IDYwLCBcIjIgZGF5c1wiLCBcIjEwaFwiLCBcIjdkXCIsIFwiMjAweVwiXG59O1xuaW50ZXJmYWNlIElUcmFjZXJjb25maWcge1xuICAgIGZpbHRlcnM6IEVudW1UcmFjZXJjb25maWdTZXR0aW5nO1xuICAgIG9wZW46IGJvb2xlYW47XG59XG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6dmFyaWFibGUtbmFtZVxuY29uc3QgVHJhY2VyY29uZmlnOiBJVHJhY2VyY29uZmlnID0ge1xuICAgIGZpbHRlcnM6IEVudW1UcmFjZXJjb25maWdTZXR0aW5nLk5vRmlsdGVyLFxuICAgIG9wZW46IHRydWVcbn07XG4vLyBsaXN0ZW4gcG9ydFxuY29uc3QgaHR0cFBvcnQ6IG51bWJlciA9IDMxMDA7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICBkb21haW5OYW1lLFxuICAgIGh0dHBQb3J0LFxuICAgIGp3dCxcbiAgICBUcmFjZXJjb25maWdcbn07XG4iXX0=