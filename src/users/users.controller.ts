import { Body, Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { request } from 'http';
import { CreateUser } from './dto/create-user.dto';
import { SelectUser } from './dto/select-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  async getUsers() {
    return this.userService.getUsers();
  }

  @Post()
  async createUser(@Body() request: CreateUser) {
    return this.userService.createUser(request);
  }

  @Delete()
  async deleteUser(@Body() request: SelectUser) {
    if (request.id) return this.userService.deleteUser(request.id);
  }

  @Put()
  async updateUser(@Body() request: SelectUser) {
    if (request.id) return this.userService.updateUser(request.id, request);
  }
}
